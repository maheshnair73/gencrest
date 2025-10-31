# Technical Architecture

## System Architecture
```
Frontend (React/TypeScript) → Nginx → Node.js API → PostgreSQL
                            ↓
                        Service Worker (Offline)
```

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js/Express, JWT Auth
- **Database**: PostgreSQL
- **Web Server**: Nginx
- **Build**: Vite
- **Deployment**: VM (Ubuntu/CentOS)
- **Process Manager**: PM2
- **Storage**: Local filesystem/MinIO

## Key Components
- **Authentication**: JWT with bcrypt
- **Data Layer**: PostgreSQL with Prisma ORM
- **State Management**: React hooks + Context
- **Routing**: React Router DOM
- **UI Components**: Custom components with Tailwind
- **File Storage**: MinIO/Local storage

## Data Flow
1. User actions → React components
2. API calls → Express.js API
3. Offline queue → Service worker
4. Sync on reconnection

## Security
- JWT token authentication
- Password hashing with bcrypt
- Role-based middleware
- HTTPS/SSL certificates
- Input validation and sanitization

## Performance
- Code splitting by routes
- Lazy loading components
- Nginx caching and compression
- Database connection pooling
- Redis for session management

## Scalability
- Load balancer (Nginx)
- Database replication
- Static asset optimization
- PM2 cluster mode