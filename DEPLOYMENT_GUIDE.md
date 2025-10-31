# Deployment Guide

## Prerequisites
- Ubuntu 20.04+ VM
- Node.js 18+
- PostgreSQL 15+
- Redis
- Nginx

## Environment Setup
```bash
# Install dependencies
npm install
cd server && npm install

# Environment variables
cp .env.example .env
```

## Required Environment Variables
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://gencrest:password@localhost:5432/gencrest_db
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
UPLOAD_PATH=/opt/gencrest/uploads
VITE_API_URL=https://yourdomain.com/api
```

## Development
```bash
# Frontend
npm run dev

# Backend
cd server && npm run dev
```

## Build
```bash
npm run build
cd server && npm run build
```

## Production Deployment

### Option 1: Docker Compose (Recommended)
```bash
# Automated deployment
./deploy.sh
```

### Option 2: Manual VM Setup
```bash
# See VM_DEPLOYMENT.md for detailed steps
```

### Option 3: Docker Only
```bash
docker-compose up -d
```

## Database Setup
1. Install PostgreSQL
2. Create database and user
3. Run Prisma migrations
4. Seed initial data

## Post-Deployment
- [ ] Verify all routes work
- [ ] Test authentication flow
- [ ] Validate offline functionality
- [ ] Check performance metrics
- [ ] Monitor error logs

## Rollback Procedure
1. Revert to previous deployment
2. Check database consistency
3. Notify users of any issues
4. Document lessons learned

## Monitoring
- Application performance monitoring
- Error tracking
- User analytics
- Database performance
- Infrastructure metrics