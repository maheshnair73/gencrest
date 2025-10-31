# Docker Compose VM Deployment

## Prerequisites
- Ubuntu 20.04+ VM
- 8GB RAM, 4 CPU cores
- Ports 80, 443, 22 open

## Quick Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone <repository-url> /opt/gencrest
cd /opt/gencrest
cp .env.example .env.production
docker-compose up -d
```

## SSL Setup
```bash
# Install Certbot
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf with SSL paths
# Restart containers
docker-compose restart nginx
```

## Management Commands
```bash
# View logs
docker-compose logs -f

# Update application
git pull
docker-compose build
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U gencrest gencrest_db > backup.sql

# Scale services
docker-compose up -d --scale app=3
```

## Monitoring
```bash
# Container stats
docker stats

# Service health
docker-compose ps
```