# Local Development Setup

## Prerequisites
- Node.js 18+
- PostgreSQL (optional for basic testing)
- Redis (optional for basic testing)

## Quick Start (Mock Data)
```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Setup environment
cp .env.example .env

# 3. Start backend (Terminal 1)
cd server && npm run dev

# 4. Start frontend (Terminal 2)
npm run dev
```

## Test Login
- Email: `admin@gencrest.com`
- Password: `password`

## Environment Variables
```
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_key_here
VITE_API_URL=http://localhost:3001/api
```

## Available Scripts
```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production

# Backend
cd server
npm run dev          # Start with nodemon
npm start            # Start production
```

## API Endpoints
- POST `/api/auth/login` - Login
- GET `/api/dashboard` - Dashboard data
- GET `/api/visits` - Field visits
- GET `/api/orders` - Sales orders

## Development URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api