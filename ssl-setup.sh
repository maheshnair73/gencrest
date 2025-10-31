#!/bin/bash

# SSL Certificate Setup for GenCrest

set -e

DOMAIN=${1:-yourdomain.com}

echo "🔒 Setting up SSL for domain: $DOMAIN"

# Install Certbot
echo "📦 Installing Certbot..."
sudo apt update
sudo apt install -y certbot

# Stop nginx container temporarily
echo "⏸️ Stopping nginx container..."
docker-compose stop nginx

# Generate certificate
echo "🔐 Generating SSL certificate..."
sudo certbot certonly --standalone -d $DOMAIN --agree-tos --no-eff-email

# Update nginx configuration
echo "⚙️ Updating nginx configuration..."
sed -i "s/yourdomain.com/$DOMAIN/g" nginx.conf
sed -i 's/# return 301/return 301/' nginx.conf

# Create certificate volume mapping
echo "📁 Setting up certificate volumes..."
mkdir -p ./ssl
sudo cp -r /etc/letsencrypt ./ssl/

# Update docker-compose with SSL volumes
cat >> docker-compose.yml << EOF

  nginx:
    volumes:
      - ./ssl/letsencrypt:/etc/letsencrypt:ro
EOF

# Restart services
echo "🔄 Restarting services..."
docker-compose up -d

echo "✅ SSL setup complete!"
echo "🌐 Your site should now be available at: https://$DOMAIN"