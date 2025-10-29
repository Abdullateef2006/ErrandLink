# ErrandLink Backend (MongoDB)

This is an alternate backend for ErrandLink using Express + Mongoose (MongoDB).

Structure

- src/controllers: route handlers (auth, orders, reviews, admin, uploads)
- src/middleware: auth and upload middleware
- src/models: Mongoose schemas: User, Order, Review, Message
- src/routes: Express routes organized by resource
- src/services: business logic (payment service)
- email.templates: folder for email templates
- products: product-related logic (placeholder)
- uploads: local uploads

Quick start

1. Copy `.env.example` to `.env` and set `MONGO_URI`.
2. cd backend_mongo
3. npm install
4. npm run dev

API overview

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/orders (list open)
- POST /api/orders (create order) - holds payment from requester's wallet
- POST /api/orders/:id/accept
- PATCH /api/orders/:id/status
- POST /api/reviews
- POST /api/uploads/document (file upload)
- Admin routes under /api/admin

Notes

- Payment flows are simulated via walletBalance on User + order.escrowHeld field.
- Replace MONGO_URI with a real MongoDB URI in production.
