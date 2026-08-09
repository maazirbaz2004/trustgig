# TrustGig — Step-by-Step Execution Guide

A straight, ordered checklist to actually execute — no theory, just "do this, then this." Follow top to bottom. Each step assumes the ones before it are done. Pairs with `TrustGig_Implementation_Plan.md` for the *why* behind each step.

---

## Phase 1 — Accounts & Environment (Day 1)

1. [ ] Install Node.js (LTS) and Git if not already installed.
2. [ ] Create a free GitHub account (if needed) and a new empty repo called `trustgig`.
3. [ ] Create a free MongoDB Atlas account → **Build a Database** → choose the free **M0** tier.
4. [ ] In Atlas: create a database user (username + password, save it somewhere safe).
5. [ ] In Atlas: **Network Access** → Add IP Address → **Allow Access From Anywhere** (`0.0.0.0/0`).
6. [ ] In Atlas: **Connect** → **Drivers** → copy the connection string (looks like `mongodb+srv://user:<password>@cluster...`).
7. [ ] Create a free Cloudinary account → from the dashboard, copy **Cloud Name**, **API Key**, **API Secret**.
8. [ ] Create a free Vercel account and connect it to your GitHub account (you'll use this in Phase 5).

---

## Phase 2 — Project Skeleton (Day 1)

9. [ ] `git clone` your empty repo locally, `cd trustgig`.
10. [ ] Create the two top-level folders: `mkdir client server`.
11. [ ] Create a root `.gitignore` with at least:
    ```
    node_modules/
    .env
    dist/
    .vercel/
    ```
12. [ ] Create a root `README.md` and paste in the MVP scope list (from the implementation plan, Section 1).
13. [ ] Commit: `git add . && git commit -m "init project structure"`.

---

## Phase 3 — Backend, one working piece at a time

Work inside `server/`. After every numbered step, test it with Postman/Thunder Client/curl before moving to the next — don't stack unverified code.

14. [ ] `cd server && npm init -y`
15. [ ] `npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer cloudinary express-async-errors`
16. [ ] `npm install -D nodemon`
17. [ ] Create `.env` in `server/` with `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLIENT_URL=http://localhost:5173`.
18. [ ] Create `src/config/db.js` — connects Mongoose to `MONGO_URI`.
19. [ ] Create `src/app.js` — sets up `express()`, `cors()`, `express.json()`, imports `express-async-errors`, adds a `GET /api/health` route that returns `{ status: "ok" }`. **Export the app, do not call `.listen()` here.**
20. [ ] Create `src/server.js` — imports `app` and `db.js`, calls `connectDB()` then `app.listen(process.env.PORT || 5000)`. This file is for **local dev only**.
21. [ ] Add to `package.json` scripts: `"dev": "nodemon src/server.js"`.
22. [ ] Run `npm run dev` → confirm `http://localhost:5000/api/health` responds.
23. [ ] Create `src/models/User.js` (schema from the implementation plan, Section 4.1).
24. [ ] Create `src/controllers/authController.js` with `register` and `login` functions (bcrypt hash password on register, compare + sign JWT on login).
25. [ ] Create `src/routes/authRoutes.js`, mount at `/api/auth` in `app.js`.
26. [ ] Test: register a user via Postman, then log in, confirm you get a JWT back.
27. [ ] Create `src/middleware/auth.js` — a `protect` middleware that verifies the JWT from the `Authorization` header and attaches `req.user`.
28. [ ] Create `src/controllers/userController.js` with `getMe` (`GET /api/users/me`, protected) — test it with the token from step 26.
29. [ ] Set up Cloudinary: `src/config/cloudinary.js`, plus `src/middleware/upload.js` (multer, memory storage, streamed to Cloudinary).
30. [ ] Add `POST /api/users/cnic` (protected) — uploads CNIC image, sets `cnicImageUrl` on the user, leaves `isVerified: false`. Test with a sample image.
31. [ ] Create `src/middleware/requireRole.js` — blocks a route unless `req.user.role` matches.
32. [ ] Add admin endpoints: `GET /api/admin/pending-verifications`, `PUT /api/admin/verify/:userId` (protected + `requireRole("admin")`). Manually set one test user's role to `"admin"` directly in Atlas to test this.
33. [ ] Create `src/models/Gig.js`, `src/controllers/gigController.js`, `src/routes/gigRoutes.js` — full CRUD, plus `GET /api/gigs?city=&category=` filtering. Test create + filter.
34. [ ] Create `src/models/Booking.js` and `src/models/WalletTransaction.js`.
35. [ ] Create `src/services/escrowService.js` with three functions: `fundEscrow`, `releaseEscrow`, `refundEscrow` (logic from implementation plan, Section 5, step 7). For MVP, give every new user a starting `walletBalance` (e.g. 5000) on registration so there's something to spend in demos.
36. [ ] Create `src/controllers/bookingController.js`:
    - `POST /api/bookings` → creates booking, calls `fundEscrow`
    - `PUT /api/bookings/:id/deliver` → freelancer-only, sets status `delivered`
    - `PUT /api/bookings/:id/approve` → client-only, calls `releaseEscrow`
    Test the full booking → deliver → approve cycle end to end via Postman, confirming wallet balances change correctly.
37. [ ] Create `src/models/Dispute.js`, controller, and routes: `POST /api/disputes` (evidence upload via Cloudinary), `PUT /api/admin/disputes/:id/resolve` (admin triggers `releaseEscrow` or `refundEscrow`). Test both outcomes.
38. [ ] Create `src/models/Review.js`, controller, and route: `POST /api/reviews` (only if booking is `completed`), recalculate the reviewed user's `avgRating`. Test it.
39. [ ] Create `src/middleware/errorHandler.js`, mount it last in `app.js` so all controllers can just `throw` errors.
40. [ ] Create `scripts/seed.js` — inserts 2-3 demo users and 4-5 demo gigs. Run it once against your Atlas DB so your deployed app isn't empty on first look.
41. [ ] Commit backend: `git add . && git commit -m "backend MVP complete"`.

---

## Phase 4 — Frontend, page by page

Work inside `client/`. Run the backend locally (`npm run dev` in `server/`) while building.

42. [ ] `cd ../client && npm create vite@latest . -- --template react` (use current directory).
43. [ ] `npm install react-router-dom axios`
44. [ ] Create `.env` in `client/` with `VITE_API_URL=http://localhost:5000/api`.
45. [ ] Create `src/api/axios.js` — an axios instance with `baseURL: import.meta.env.VITE_API_URL`, and a request interceptor that attaches the JWT from `localStorage` if present.
46. [ ] Create `src/context/AuthContext.jsx` — holds `user`, `token`, `login()`, `register()`, `logout()`, persists token to `localStorage`.
47. [ ] Set up `react-router-dom` in `App.jsx` with routes: `/`, `/login`, `/register`, `/gigs`, `/gigs/:id`, `/dashboard`, `/admin`.
48. [ ] Build `Register.jsx` and `Login.jsx` pages, wire to `AuthContext`. Test: register/login against your running local backend.
49. [ ] Build `Profile.jsx` — shows user info, has a CNIC upload form. Test the upload flow end to end.
50. [ ] Build `GigsList.jsx` — fetches `/api/gigs`, shows cards, has city + category filter inputs.
51. [ ] Build `GigDetail.jsx` — shows one gig, has a "Book this gig" button (only visible if logged in as a client) that calls `POST /api/bookings`.
52. [ ] Build `ClientDashboard.jsx` — lists the logged-in client's bookings with status badges and an "Approve delivery" button where relevant.
53. [ ] Build `FreelancerDashboard.jsx` — "My Gigs" (create/edit form + list) and "My Bookings" with a "Mark delivered" button.
54. [ ] Build `DisputeForm.jsx` (reachable from a booking's detail view) — reason text + evidence file upload.
55. [ ] Build `AdminPanel.jsx` — pending verifications list with an "Approve" button, open disputes list with "Release" / "Refund" buttons.
56. [ ] Build `ReviewForm.jsx` — shown only for `completed` bookings, star rating + comment.
57. [ ] Add a basic `ProtectedRoute` wrapper component that redirects to `/login` if no user, and an `AdminRoute` variant that also checks `role === "admin"`.
58. [ ] Add loading spinners and error banners to every page that calls the API.
59. [ ] Style pass — pick one approach (plain CSS or Tailwind) and apply it consistently; don't perfect this, just make it presentable.
60. [ ] Commit frontend: `git add . && git commit -m "frontend MVP complete"`.

---

## Phase 5 — Full local run-through

61. [ ] With both `server` (`npm run dev`) and `client` (`npm run dev`) running locally, open two browser windows (one normal, one incognito).
62. [ ] Register a client account in one, a freelancer account in the other.
63. [ ] Upload CNIC for both. Log in as a manually-promoted admin (or a third window) and approve both.
64. [ ] As freelancer: create a gig.
65. [ ] As client: find the gig, book it, confirm wallet balance decreases and booking shows `funded`.
66. [ ] As freelancer: mark it delivered.
67. [ ] As client: approve it, confirm freelancer's wallet balance increases and booking shows `completed`.
68. [ ] Test a dispute: raise one, resolve as admin with a **refund**, confirm client's balance is restored. Repeat with **release** on a second booking.
69. [ ] Leave a review as client on the freelancer, confirm `avgRating` updates on the freelancer's profile.
70. [ ] Fix anything broken before moving to deployment.

---

## Phase 6 — Deploy to Vercel

71. [ ] Push everything: `git push origin main`.
72. [ ] In `server/`, create `api/index.js`:
    ```js
    const app = require("../src/app");
    module.exports = app;
    ```
73. [ ] In `server/`, create `vercel.json`:
    ```json
    {
      "version": 2,
      "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
      "routes": [{ "src": "/(.*)", "dest": "api/index.js" }]
    }
    ```
74. [ ] Commit and push these two new files.
75. [ ] In Vercel: **Add New Project** → import `trustgig` → set **Root Directory** to `server`.
76. [ ] Add environment variables in Vercel (Project Settings → Environment Variables): `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Leave `CLIENT_URL` for now.
77. [ ] Deploy. Copy the resulting URL (e.g. `https://trustgig-api.vercel.app`).
78. [ ] Test it: visit `https://trustgig-api.vercel.app/api/health` in a browser — should return `{ status: "ok" }`.
79. [ ] In Vercel: **Add New Project** again → same repo → set **Root Directory** to `client`.
80. [ ] Add environment variable: `VITE_API_URL=https://trustgig-api.vercel.app/api`.
81. [ ] Deploy. Copy the resulting URL (e.g. `https://trustgig.vercel.app`).
82. [ ] Go back to the **backend** project's environment variables, add `CLIENT_URL=https://trustgig.vercel.app`, and trigger a redeploy (Vercel → Deployments → Redeploy).
83. [ ] Re-check Atlas Network Access is still `0.0.0.0/0`.

---

## Phase 7 — Production smoke test

84. [ ] Repeat every checkbox from Phase 5 (steps 61-69), but on the live `https://trustgig.vercel.app` URL instead of localhost.
85. [ ] Confirm image uploads (CNIC, dispute evidence) work in production — this is the step most likely to break first (check Cloudinary env vars if it fails).
86. [ ] Confirm CORS isn't blocking requests (check `CLIENT_URL` matches exactly, including `https://` and no trailing slash).
87. [ ] Run the seed script once against production (or manually create a couple of demo gigs) so the deployed app has content when reviewers open it.

---

## Phase 8 — Wrap-up

88. [ ] Set up a free **UptimeRobot** monitor pointed at `https://trustgig-api.vercel.app/api/health`.
89. [ ] Update `README.md` with: live demo link, setup instructions, MVP scope, and 2-3 screenshots.
90. [ ] Tag a release in GitHub (e.g. `v1.0-mvp`) so you have a clean snapshot of the submitted version.

---

**You're done.** Everything from here is Phase 2 (paid) work — see the "Later, once funded" section in `TrustGig_Implementation_Plan.md`.
