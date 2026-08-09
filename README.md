# TrustGig 🛡️

TrustGig is a secure, zero-cost MVP for a Pakistani freelance marketplace. It connects users with trusted service providers while ensuring payment security through an escrow system and manual KYC verification.

## 🚀 Live Demo
- **Live URL:** *Waiting for Vercel Deployment...*
- **Test Admin Credentials:** (Create an account, then run `node seed_admin.js` in the `server` folder to promote it to Admin)

## ✨ Core Features (MVP Scope)
1. **Role-Based Authentication:** Clean separation between Clients, Freelancers, and Admins.
2. **Mandatory KYC Verification:** Freelancers must upload their CNIC (via direct Cloudinary integration) and be manually approved by an Admin before creating gigs.
3. **Gig Marketplace:** Clients can browse, search, and filter service gigs by category and city.
4. **Manual Escrow Deposits:** Since Stripe isn't supported in Pakistan, we built a manual deposit workflow. Clients upload Meezan Bank transaction receipts, which Admins verify to credit their in-app `walletBalance`.
5. **Secure Gig Booking:** Booking a gig locks funds in escrow. Once work is delivered and approved, funds are released to the freelancer.
6. **Dispute Resolution:** Built-in dispute flow where admins mediate conflicts and can manually issue full refunds or release funds.
7. **Real-Time In-App Chat:** Powered by `socket.io`, allowing clients and freelancers to communicate seamlessly.
8. **Admin Moderation Panel:** A dedicated portal for Admins to review KYC documents, verify bank deposits/withdrawals, and resolve active disputes.

*(Note: Real JazzCash/Easypaisa API integrations and automated OCR KYC are out of scope for this MVP phase.)*

## 🛠️ Tech Stack
- **Frontend:** React, Vite, React Router, custom CSS design system (Indigo theme).
- **Backend:** Node.js, Express, MongoDB (Mongoose).
- **Real-Time:** Socket.io.
- **File Storage:** Cloudinary (unsigned direct uploads for zero-latency client uploads).

## 💻 Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL
- Cloudinary Account (with an unsigned upload preset named `trustgig_uploads`)

### 2. Environment Variables
**In `server/.env`:**
```env
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

**In `client/.env`:**
```env
VITE_API_URL=http://localhost:5001/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Running the App
1. Open a terminal in the `server` folder:
   ```bash
   npm install
   npm run dev
   ```
2. Open a second terminal in the `client` folder:
   ```bash
   npm install
   npm run dev
   ```
3. Visit `http://localhost:5173` in your browser.

## 🚀 Deployed Link
*(Add your live Vercel URL here once deployed)*
