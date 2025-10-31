#!/bin/bash

# GenCrest VM Deployment Script

set -e

echo "🚀 Starting GenCrest deployment..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f .env.production ]; then
    cp .env.example .env.production
    echo "📝 Please edit .env.production with your settings"
fi

# Create required directories
mkdir -p uploads logs

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose -f docker-compose.yml --env-file .env.production up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo "✅ Deployment complete!"
echo "🌐 Application should be available at: http://$(curl -s ifconfig.me)"
echo "📊 Monitor with: docker-compose logs -f"