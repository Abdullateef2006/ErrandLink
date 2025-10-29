# ErrandLink — Community Micro-Task Marketplace Backend

ErrandLink is a robust backend platform for a community-driven micro-task marketplace that connects people who need quick errands done with nearby, trusted helpers. The platform enables secure transactions, real-time communication, and reliable task management.

## Available Implementations

Two backend variants are provided to suit different deployment needs:

- `src/` — Express + Sequelize + SQLite implementation with Socket.io for real-time features
- `backend_mongo/` — Express + Mongoose + MongoDB implementation with modular architecture

## Core Features

### User Management & Authentication

- Secure JWT-based authentication
- Role-based access (Requester, Runner, Admin)
- User verification system
- Profile management
- Location-based services

### Errand Management

- Create and browse errands
- Location-based errand discovery
- Detailed errand tracking
- File attachment support
- Status updates and notifications
- Distance-based matching (Haversine algorithm)

### Payment System

- Secure wallet system
- Escrow service for transactions
- Automated payment processing
- Transaction history
- Refund handling
- Platform fee management

### Real-time Features

- Live chat between users
- Real-time location tracking
- Instant notifications
- Status updates
- Socket.io integration

### Reviews & Ratings

- User review system
- Rating calculations
- Comment management
- Verification of reviews
- Rating aggregation

### Security Features

- Password hashing with bcrypt
- JWT token management
- Input validation
- File upload security
- Role-based permissions

### Admin Features

- User management dashboard
- Transaction monitoring
- Dispute resolution system
- System analytics
- Content moderation

## API Endpoints

### Authentication

```
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
```

### Errands

```
POST /api/errands - Create errand
GET /api/errands - List errands
GET /api/errands/:id - Get details
POST /api/errands/:id/accept
PATCH /api/errands/:id/status
```

### Wallet Operations

```
GET /api/wallet - Check balance
POST /api/wallet/deposit
POST /api/wallet/withdraw
GET /api/wallet/transactions
```

### Reviews

```
POST /api/reviews - Create review
GET /api/reviews/user/:userId
GET /api/reviews/errand/:errandId
```

### Admin Operations

```
GET /api/admin/dashboard
GET /api/admin/users
POST /api/admin/users/:userId/verify
GET /api/admin/disputes
POST /api/admin/disputes/:errandId/resolve
```

## Getting Started

### SQLite Version (Default)

1. Set up environment:

```bash
copy .env.example .env
npm install
```

2. Start development server:

```bash
npm run dev
```

The server will automatically:

- Create SQLite database
- Sync all models
- Start on configured port (default: 4000)

### MongoDB Version

1. Setup:

```bash
cd backend_mongo
copy .env.example .env
npm install
```

2. Configure MongoDB URI in .env

3. Start server:

```bash
npm run dev
```

## Environment Configuration

Important environment variables:

- `PORT` - Server port
- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - SQLite database path
- `MONGO_URI` - MongoDB connection string
- `FIREBASE_SERVICE_ACCOUNT` - Firebase credentials (optional)

## Real-time Features

Socket.io integration enables:

- Real-time chat
- Location updates
- Status notifications
- Room-based communication



## File Upload System

- Supports document verification
- Profile picture uploads
- Errand attachments
- Secure file handling
- Configurable storage options

## Security Implementation

- JWT token authentication
- Password hashing
- Input sanitization
- File upload validation
- Role-based access control
- Rate limiting capabilities

## Project Structure

```
src/
├── controllers/   # Request handlers
├── models/       # Database models
├── routes/       # API routes
├── middleware/   # Custom middleware
├── services/     # Business logic
├── utils/        # Helper functions
└── config/       # Configuration
```

## Error Handling

Standardized error responses:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Database Management

- Automatic migrations (Sequelize)
- Data relationships
- Transaction support
- Indexing optimization
- Backup capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
