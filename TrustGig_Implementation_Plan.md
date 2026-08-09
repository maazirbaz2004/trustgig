# TrustGig — Implementation Plan (Zero-Cost MVP → Vercel Deployment)

This plan takes TrustGig from an empty repo to a live, publicly accessible MVP using **only free tiers**. Paid pieces (real JazzCash/Easypaisa merchant API, paid KYC, custom domain, dedicated DB cluster) are called out separately in a "Later, once funded" section so you know exactly what to upgrade when money is available.

---

## 0. Zero-cost stack decision (read this first)

| Layer | Tool | Why it's free |
|---|---|---|
| Frontend hosting | **Vercel** (Hobby plan) | Free forever for personal/small projects |
| Backend hosting | **Vercel Serverless Functions** (same project) or **Render Free Web Service** | Both have $0 tiers; plan below uses Vercel for both so everything lives in one deployment |
| Database | **MongoDB Atlas M0 (Free Shared Cluster)** | 512MB free forever |
| File/image storage | **Cloudinary Free Tier** | 25GB storage/bandwidth free, needed for CNIC images, gig photos, dispute evidence |
| Auth | **JWT (self-built, jsonwebtoken + bcrypt)** | No third-party auth cost |
| Payments (MVP) | **Mock Escrow Wallet** (your own simulated ledger, no real money moves) | Real JazzCash/Easypaisa merchant accounts require business registration + fees — not available at zero cost |
| KYC/CNIC verification (MVP) | **Manual admin review** of an uploaded CNIC photo | Automated OCR/KYC APIs are paid |
| Email (optional, notifications) | **Resend free tier** or skip entirely for MVP | 3,000 emails/month free |
| Version control / CI | **GitHub** + **Vercel's built-in Git integration** | Free, auto-deploys on push |
| Error/uptime monitoring | **Vercel's built-in logs** + **UptimeRobot free tier** | No cost |

> **Key MVP compromise:** Real wallet integration (JazzCash/Easypaisa) needs a registered business/merchant account, which is a business step, not a coding one, and isn't free. The MVP therefore ships with a **mock escrow module** that behaves identically (fund → hold → release/refund) but moves fake balances. This lets you build, demo, and validate the entire trust/escrow flow now, and swap in the real payment gateway later by only touching one module (see Section 6.4).

---

## 1. Scope the MVP (before writing any code)

Cut the full vision down to what one person can actually ship. Suggested MVP feature list:

**In scope for MVP:**
1. User registration/login (client or freelancer role)
2. Manual CNIC upload + admin approval (verified badge)
3. Freelancer can create a gig listing (title, category, description, price, city)
4. Client can browse/search/filter gigs by city + category
5. Client can book a gig → funds move into **mock escrow**
6. Freelancer marks work delivered → client approves → escrow releases to freelancer's in-app balance
7. Basic dispute flow (either party flags an issue → status changes to "disputed" → admin manually resolves)
8. Ratings/reviews after a completed gig
9. Simple admin panel (approve CNIC, resolve disputes)

**Explicitly out of scope for MVP** (Phase 2+):
- Real JazzCash/Easypaisa payments
- Automated KYC/OCR
- In-app chat (use a simple "contact info reveal after booking" instead, or a basic message thread if time allows)
- Push notifications
- Mobile app (PWA wrapper can come later)
- Multi-language switch (ship English first, add Urdu strings later if time permits)

Write this list down in your repo's `README.md` under "MVP Scope" — it keeps you from scope-creeping mid-build.

---

## 2. Repository & project structure

Use a **monorepo** (one GitHub repo, two folders) — simplest for a solo/small team project and works cleanly with Vercel.

```
trustgig/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/             # axios instance + API call functions
│   │   ├── components/      # reusable UI components
│   │   ├── pages/           # route-level pages
│   │   ├── context/         # AuthContext, etc.
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/           # db.js, cloudinary.js
│   │   ├── models/           # Mongoose schemas
│   │   ├── controllers/      # route logic
│   │   ├── routes/           # express routers
│   │   ├── middleware/       # auth.js, errorHandler.js, upload.js
│   │   ├── services/         # escrowService.js (mock wallet logic), notificationService.js
│   │   └── app.js            # express app instance (exported, not listened here)
│   ├── api/
│   │   └── index.js          # Vercel serverless entrypoint (wraps app.js)
│   ├── vercel.json
│   └── package.json
│
├── .gitignore
└── README.md
```

**Why split client/server instead of one Vercel project?** Vercel deploys each as its own project pointing at the same repo (set a "Root Directory" per project). This keeps builds fast and independent, and matches how MERN apps are normally reasoned about, while still deploying "both on Vercel" as you asked.

---

## 3. Local environment setup

1. Install Node.js LTS, and `git`.
2. `mkdir trustgig && cd trustgig && git init`
3. Create the `client/` and `server/` folders as above.
4. Create a free **MongoDB Atlas** account → create an M0 free cluster → create a database user → whitelist `0.0.0.0/0` (allow all IPs, fine for a free-tier learning project) → copy the connection string.
5. Create a free **Cloudinary** account → grab your cloud name, API key, API secret.
6. In `server/`, create a `.env` file (never commit this — add to `.gitignore`):
   ```
   MONGO_URI=your_atlas_connection_string
   JWT_SECRET=some_long_random_string
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   CLIENT_URL=http://localhost:5173
   ```

---

## 4. Database design (MongoDB / Mongoose schemas)

Design collections before writing routes — this is the backbone of the app.

### 4.1 `User`
```js
{
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["client", "freelancer", "admin"], default: "client" },
  city: String,
  phone: String,
  cnicImageUrl: String,          // uploaded to Cloudinary
  isVerified: { type: Boolean, default: false }, // admin-approved CNIC
  walletBalance: { type: Number, default: 0 },   // mock wallet
  bio: String,
  skills: [String],              // for freelancers
  avgRating: { type: Number, default: 0 },
  createdAt: Date
}
```

### 4.2 `Gig`
```js
{
  freelancer: { type: ObjectId, ref: "User" },
  title: String,
  description: String,
  category: { type: String, enum: ["digital", "trade"] },
  subCategory: String,           // e.g. "tutoring", "electrician"
  price: Number,                 // PKR
  city: String,
  images: [String],
  status: { type: String, enum: ["active", "paused"], default: "active" },
  createdAt: Date
}
```

### 4.3 `Booking` (the escrow transaction)
```js
{
  gig: { type: ObjectId, ref: "Gig" },
  client: { type: ObjectId, ref: "User" },
  freelancer: { type: ObjectId, ref: "User" },
  amount: Number,
  status: {
    type: String,
    enum: ["pending_payment", "funded", "delivered", "completed", "disputed", "refunded"],
    default: "pending_payment"
  },
  escrowFundedAt: Date,
  deliveredAt: Date,
  completedAt: Date,
  notes: String
}
```

### 4.4 `Dispute`
```js
{
  booking: { type: ObjectId, ref: "Booking" },
  raisedBy: { type: ObjectId, ref: "User" },
  reason: String,
  evidenceUrls: [String],
  status: { type: String, enum: ["open", "resolved_release", "resolved_refund"], default: "open" },
  adminNote: String,
  createdAt: Date
}
```

### 4.5 `Review`
```js
{
  booking: { type: ObjectId, ref: "Booking" },
  from: { type: ObjectId, ref: "User" },
  to: { type: ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: Date
}
```

### 4.6 `WalletTransaction` (ledger for the mock escrow — important for transparency/debugging)
```js
{
  user: { type: ObjectId, ref: "User" },
  booking: { type: ObjectId, ref: "Booking" },
  type: { type: String, enum: ["fund_escrow", "release", "refund", "topup"] },
  amount: Number,
  balanceAfter: Number,
  createdAt: Date
}
```

---

## 5. Backend build order (Express + Mongoose)

Build and test in this order — each step is independently testable with Postman/Thunder Client before moving on.

1. **Bootstrap:** `npm init`, install `express mongoose bcryptjs jsonwebtoken cors dotenv multer cloudinary express-async-errors`. Set up `src/app.js` with CORS, JSON body parsing, and a `/api/health` route.
2. **DB connection:** `src/config/db.js` connecting to Atlas via `MONGO_URI`.
3. **Auth module:** `POST /api/auth/register`, `POST /api/auth/login` (bcrypt hash + JWT sign). Middleware `protect` (verifies JWT) and `requireRole(role)`.
4. **User module:** `GET /api/users/me`, `PUT /api/users/me` (profile edit), `POST /api/users/cnic` (Cloudinary upload + set `cnicImageUrl`, status pending).
5. **Admin module:** `GET /api/admin/pending-verifications`, `PUT /api/admin/verify/:userId`. Protect with `requireRole("admin")`.
6. **Gig module:** CRUD for gigs (`POST/GET/PUT/DELETE /api/gigs`), with query filters for `city` and `category`.
7. **Escrow/mock wallet service (`services/escrowService.js`)** — the core trust mechanic. Write it as pure functions so it's easy to swap later:
   - `fundEscrow(clientId, bookingId, amount)` → checks client's mock wallet balance (or auto-tops-up in dev/demo mode), deducts, creates `WalletTransaction`, sets booking to `funded`.
   - `releaseEscrow(bookingId)` → credits freelancer's `walletBalance`, logs transaction, sets booking to `completed`.
   - `refundEscrow(bookingId)` → credits client back, logs transaction, sets booking to `refunded`.
   - Because this is isolated in one service file, swapping in real JazzCash/Easypaisa APIs later means rewriting only this file, not your routes or frontend.
8. **Booking module:** `POST /api/bookings` (create + call `fundEscrow`), `PUT /api/bookings/:id/deliver` (freelancer marks delivered), `PUT /api/bookings/:id/approve` (client approves → `releaseEscrow`).
9. **Dispute module:** `POST /api/disputes` (with Cloudinary evidence upload), `PUT /api/admin/disputes/:id/resolve` (admin triggers `releaseEscrow` or `refundEscrow`).
10. **Review module:** `POST /api/reviews` (only allowed if booking status is `completed`), recalculate `avgRating` on the reviewed user.
11. **Error handling & validation:** centralized `errorHandler.js` middleware; use `express-async-errors` so you don't need try/catch everywhere; add basic input validation (e.g. with `zod` or manual checks).
12. **Seed script:** a `scripts/seed.js` that inserts a few demo users/gigs so your deployed demo isn't empty.

---

## 6. Frontend build order (React via Vite)

1. **Bootstrap:** `npm create vite@latest client -- --template react`, then install `react-router-dom axios`.
2. **API layer:** `src/api/axios.js` with `baseURL` from an environment variable (`VITE_API_URL`), attaching the JWT from local storage to headers.
3. **Auth context:** `AuthContext` storing current user + token, `login()`, `register()`, `logout()`.
4. **Routing skeleton:** `/`, `/login`, `/register`, `/gigs`, `/gigs/:id`, `/dashboard`, `/admin` (protected routes wrap admin/auth-only pages).
5. **Pages, in build order:**
   - Register/Login
   - Profile page (edit info, upload CNIC)
   - Gig listing page (browse/search/filter by city + category)
   - Gig detail page + "Book this gig" button → creates a booking
   - Client dashboard: "My Bookings" with status badges, "Approve delivery" button
   - Freelancer dashboard: "My Gigs" (create/edit), "My Bookings" with "Mark delivered" button
   - Dispute form (from a booking detail page)
   - Admin panel: pending verifications list, open disputes list, resolve actions
   - Review form after a completed booking
6. **UI approach:** keep it simple and fast to build — plain CSS or a lightweight utility framework (e.g. Tailwind via Vite plugin) rather than a heavy component library, since this is zero-budget and time-constrained.
7. **Loading/error states:** every API call should show a loading indicator and a friendly error message — cheap to add now, saves a lot of debugging confusion later.

---

## 7. Local integration testing checklist

Before touching deployment, walk through the full flow locally with two browser sessions (or incognito) — one as client, one as freelancer:

- [ ] Register both accounts, log in
- [ ] Upload CNIC on both, approve both from an admin account
- [ ] Freelancer creates a gig
- [ ] Client finds it, books it, funds mock escrow
- [ ] Freelancer marks delivered
- [ ] Client approves → freelancer wallet balance increases
- [ ] Try a dispute path: raise a dispute, resolve as admin (both release and refund outcomes)
- [ ] Leave a review, confirm average rating updates

---

## 8. Deploying to Vercel (zero cost)

### 8.1 Push to GitHub
```bash
git add .
git commit -m "MVP ready for deployment"
git remote add origin https://github.com/<you>/trustgig.git
git push -u origin main
```

### 8.2 Deploy the backend (`server/`) on Vercel
1. In Vercel, "Add New Project" → import the repo → set **Root Directory** to `server`.
2. Vercel needs an entrypoint file for serverless functions. Create `server/api/index.js`:
   ```js
   const app = require("../src/app"); // your Express app, exported (not app.listen)
   module.exports = app;
   ```
3. Add `server/vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "api/index.js" }]
   }
   ```
4. Make sure `src/app.js` exports the Express app instance and does **not** call `app.listen()` (Vercel handles that) — keep a small separate `src/server.js` with `app.listen()` only for local dev.
5. In Vercel's dashboard → Project → Settings → Environment Variables, add `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLIENT_URL` (set this to your frontend's Vercel URL once you have it).
6. Deploy. Note the resulting URL, e.g. `https://trustgig-api.vercel.app`.

### 8.3 Deploy the frontend (`client/`) on Vercel
1. "Add New Project" again → same repo → set **Root Directory** to `client`.
2. Framework preset: Vite (auto-detected).
3. Add environment variable `VITE_API_URL=https://trustgig-api.vercel.app/api`.
4. Deploy. You'll get a URL like `https://trustgig.vercel.app`.
5. Go back to the backend project's env vars and set `CLIENT_URL` to this frontend URL (for CORS), then redeploy the backend.

### 8.4 MongoDB Atlas network access
Double-check Atlas → Network Access allows `0.0.0.0/0`, since Vercel serverless functions run from rotating IPs — this is required for the free-tier setup to work reliably.

### 8.5 Smoke test in production
Repeat the checklist from Section 7 against the live URLs.

---

## 9. Post-deployment housekeeping (still free)

- Set up **UptimeRobot** (free) to ping `/api/health` every few minutes so you notice if the backend goes down.
- Enable **Vercel's built-in deployment previews** — every pull request gets its own preview URL automatically, useful once you're iterating.
- Add a simple `README.md` with setup instructions, the MVP scope list from Section 1, and screenshots — useful for your submission/demo.
- Turn on GitHub branch protection on `main` if working with others, so broken code can't be pushed straight to the deployed branch.

---

## 10. Later, once funded (do not build now)

Keep this as a visible "Phase 2" list so reviewers see the roadmap without you having to build any of it for the zero-cost MVP:

1. **Real payment integration:** register a JazzCash/Easypaisa merchant account, replace `escrowService.js`'s mock functions with real API calls (fund via wallet checkout, hold via merchant settlement delay or your own ledger + payout API, release via payout API).
2. **Automated KYC/OCR** for CNIC verification (e.g. a paid identity-verification API) instead of manual admin review.
3. **Upgrade MongoDB Atlas** to a paid dedicated cluster once traffic outgrows the M0 free tier's 512MB/shared-CPU limits.
4. **Custom domain** (e.g. `trustgig.pk`) on Vercel instead of the free `.vercel.app` subdomain.
5. **Move backend off serverless** to a persistent server (Render/Railway paid tier or a VPS) if you add real-time features like in-app chat or webhooks that don't fit the serverless request/response model well.
6. **SMS notifications** (booking updates, dispute alerts) via a paid SMS gateway.
7. **Urdu localization**, PWA install prompts, and native mobile wrapper.
