# VM Deployment Guide

## Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 100GB SSD
- **CPU**: 4 cores minimum
- **Network**: Static IP, ports 80, 443, 22 open

## Installation Steps

### 1. System Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx postgresql postgresql-contrib redis-server
```

### 2. Node.js Installation
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### 3. Database Setup
```bash
# Configure PostgreSQL
sudo -u postgres createuser --interactive gencrest
sudo -u postgres createdb gencrest_db
sudo -u postgres psql -c "ALTER USER gencrest PASSWORD 'secure_password';"
```

### 4. Application Deployment
```bash
# Clone repository
git clone <repository-url> /opt/gencrest
cd /opt/gencrest

# Install dependencies
npm install
npm run build

# Start backend API
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx Configuration
```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/gencrest
sudo ln -s /etc/nginx/sites-available/gencrest /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables
```bash
# Create .env file
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://gencrest:secure_password@localhost:5432/gencrest_db
JWT_SECRET=your_jwt_secret_key
REDIS_URL=redis://localhost:6379
UPLOAD_PATH=/opt/gencrest/uploads
```

## Monitoring
```bash
# PM2 monitoring
pm2 monit

# System monitoring
sudo apt install htop iotop
```