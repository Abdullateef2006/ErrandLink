# ErrandLink — Backend

This repository contains an interview-ready backend implementation for ErrandLink — a community-driven micro-task marketplace that connects people who need quick errands done with nearby, trusted helpers.

There are two runnable backend variants included so you can choose the persistence model you prefer:

- `src/` — Express + Sequelize + SQLite implementation (default when running from repository root). Includes Socket.io realtime chat and location updates.
- `backend_mongo/` — Express + Mongoose + MongoDB implementation organized by the folder structure you requested (models, controllers, routes, services, middleware). This is provided as an alternate, modular codebase.

Both implementations provide the same core domain features (users, errands/orders, runners, wallet/escrow simulation, reviews, verification, admin features) and are suitable for demos or interviews.

---

Contents

- `src/` — Sequelize + SQLite backend (main project)

  - `src/app.js`, `src/server.js` — app bootstrap
  - `src/models/` — Sequelize models: User, Errand, Wallet, Message, Review, Escrow
  - `src/controllers/` — controllers for auth, errands, wallet, reviews, admin, verification
  - `src/routes/` — route definitions (auth, errands, wallet, reviews, admin, disputes, notifications)
  - `src/socket.js` — Socket.io realtime chat & location
  - `src/services/` — payment and notification services
  - `.env.example` — environment variables example

- `backend_mongo/` — Mongoose + MongoDB backend (alternate)
  - `backend_mongo/src/` — structured by models/controllers/routes/services
  - `backend_mongo/package.json` and `.env.example`
  - `backend_mongo/README.md` — run instructions for the Mongo backend

---

Quick decision guide

- Want a fast, file-based demo that you can run without extra services? Use `src/` (SQLite). It includes Socket.io and a simple FCM hook.
- Want a more production-like structure organized by responsibility and using MongoDB? Use `backend_mongo/` and set `MONGO_URI`.

---

High-level features

- JWT authentication, password hashing
- Requester and Runner roles (+ admin)
- Create and browse errands/orders with pickup/dropoff locations and deadlines
- Distance-based discovery (Haversine) for nearby errands
- Accept/decline and status updates (accepted, in_progress, completed)
- Wallet + escrow simulation (hold on creation, release on completion, refund support)
- Reviews & ratings (average rating maintained)
- File uploads for identity verification (Multer) and admin verification workflow
- Real-time chat and live location updates (Socket.io in the Sequelize app)
- Push notifications skeleton (Firebase Cloud Messaging integration)
- Admin dashboard endpoints: user management, disputes, analytics

---

Getting started — SQLite (default)

1. Copy environment file and install dependencies:

```powershell
copy .env.example .env
npm install
```

2. Start the app in development mode (uses `nodemon`):

```powershell
npm run dev
```

3. What happens on first run:

- Sequelize will auto-sync models and create `data/errandlink.sqlite`.
- A default admin user is seeded if none exists: `admin@errandlink.local` with password `adminpass` (change this immediately for public demos).

API base: http://localhost:4000/api (unless you changed PORT in `.env`)

---

Getting started — MongoDB variant

1. Switch to the mongo backend, install, and run:

```powershell
cd backend_mongo
copy .env.example .env
# set MONGO_URI in .env
npm install
npm run dev
```

2. The server will listen on the configured PORT (default 5000) and expose endpoints at `/api`.

---

Environment variables (important)

- `PORT` — server port
- `JWT_SECRET` — secret used to sign JWT tokens
- `DATABASE_URL` — (Sequelize) e.g. `sqlite:./data/errandlink.sqlite`
- `MONGO_URI` — (Mongo) e.g. `mongodb://localhost:27017/errandlink`
- `FIREBASE_SERVICE_ACCOUNT` — optional, JSON string for FCM (used by notification service)

---

Core API reference (concise)

Authentication

- POST /api/auth/signup

  - body: { name, email, password, role?('requester'|'runner'), lat?, lng? }
  - returns: { user, token }

- POST /api/auth/login

  - body: { email, password }
  - returns: { user, token }

- GET /api/auth/me (auth header required)

Errands / Orders

- POST /api/errands (Sequelize) or /api/orders (Mongo) — create an errand

  - body: { title, description, budget, pickupLat, pickupLng, dropLat?, dropLng?, deadline? }
  - creates the errand and places funds in escrow (simulated)

- GET /api/errands?lat=&lng=&radius= (auth) — list open errands; returns distance when lat/lng provided
- GET /api/errands/:id — get details
- POST /api/errands/:id/accept — runner accepts
- PATCH /api/errands/:id/status — update status to in_progress/completed/cancelled
  - On `completed` the platform fee is collected and runner is credited automatically.

Wallet & Payments (simulated)

- GET /api/wallet — get wallet balance
- POST /api/wallet/deposit { amount } — simulated deposit (increments balance)

Reviews

- POST /api/reviews { rating, comment, targetId, errandId } — create review
- GET /api/reviews/user/:userId — list reviews for a user

Verification & Uploads

- POST /api/verify/upload (multipart/form-data with `document`) — uploads a verification document for the current user (status `pending`)
- Admin: POST /api/admin/users/:userId/verify { verified: true|false }

Disputes & Admin

- POST /api/disputes/:errandId/dispute { reason } — file a dispute on an errand
- Admin endpoints (auth + admin role required):
  - GET /api/admin/dashboard — counts and revenue
  - GET /api/admin/users — list users
  - POST /api/admin/users/:userId/verify — verify/reject a user
  - GET /api/admin/disputes — list disputed errands
  - POST /api/admin/disputes/:errandId/resolve { resolution, refundAmount } — resolve dispute and optionally refund

---

Realtime (Sequelize app)

- Socket.io usage (client handshake should include auth token):

  const socket = io('http://localhost:4000', { auth: { token: '<JWT>' } });

- Events:
  - joinErrand(errandId) — join the errand room
  - message { errandId, text } — send chat message; server persists and broadcasts to `errand:{id}`
  - updateLocation { lat, lng, errandId? } — updates user's lat/lng and broadcasts `locationUpdate` to errand room if present

Push notifications

- A NotificationService skeleton is included that uses Firebase Admin (FCM) if `FIREBASE_SERVICE_ACCOUNT` is provided.
- Runners can be subscribed to geographic topics (simple grid-based topic naming implemented in code).

---

Database & migrations

- Sequelize app uses `sequelize.sync({ alter: true })` at startup (convenient for demo; not recommended for production).
- Mongo app uses Mongoose models and transactions when manipulating wallets/escrow.

Seed data

- On first run, the Sequelize app will create a default admin account if none exists:
  - email: `admin@errandlink.local`
  - password: `adminpass`

---

Security & production notes

- Replace `JWT_SECRET` and default admin password before any public demo.
- Move file uploads to cloud storage (S3/GCS) and remove local storage for production.
- Use a real payment gateway for production (Paystack, Flutterwave, Stripe, etc.). The current implementation simulates payments via wallets and escrow records.
- Add rate limiting, input sanitization and stronger validation for production readiness.

---

Testing & developer tools

- There are no automated tests included by default. Recommended next steps:
  - Add Jest + Supertest tests for auth, errand lifecycle, and payment flows.
  - Create a Postman collection that walks through signup -> create errand -> accept -> complete -> review.

Common troubleshooting

- "Server won't start / module not found" — run `npm install` in the appropriate folder (`.` for Sequelize app, `backend_mongo/` for Mongo app).
- "Cannot connect to MongoDB" — ensure `MONGO_URI` points to a running Mongo instance and is accessible from your environment.

---

Project roadmap / next improvements (recommended)

1. Add tests (Jest + Supertest) and CI config (GitHub Actions).
2. Replace local uploads with signed S3/GCS uploads and secure files behind presigned URLs.
3. Integrate sandbox payment provider (Paystack/Flutterwave) for realistic payment flows.
4. Harden security: rate limiting, helmet, input validation, sanitization.
5. Add email notifications and templates in `email.templates/` and wire a provider (SendGrid, SES).
6. (Optional) Consolidate to one canonical backend (SQLite or Mongo) depending on your production requirements; move Socket.io into the chosen server.

---

Contact / support

If you want me to continue: tell me which single next step you want prioritized (examples: "Add tests", "Wire Socket.io to Mongo backend", "Create Postman collection", "Add Paystack sandbox"). I’ll implement it, run the server/tests, and report back with the results.

Thank you — ready to continue when you tell me the next priority.

# ErrandLink — Backend (Express + SQLite)

This is a small but complete Express.js backend for the ErrandLink app (interview-ready). It uses SQLite via Sequelize for persistence, JWT for authentication, and Socket.io for basic real-time notifications/chat.

Quick start

1. Copy `.env.example` to `.env` and adjust values.
2. npm install
3. npm run dev (or npm start)

The server will auto-sync the DB on start and create a local SQLite file at `./data/errandlink.sqlite`.

Notes

- Payment flows are simulated via walletBalance on User + order.escrowHeld field.
- Replace MONGO_URI with a real MongoDB URI in production.

- This is a sample backend meant for interviews and demos. Replace the simulated payment flows with a real provider in production.
