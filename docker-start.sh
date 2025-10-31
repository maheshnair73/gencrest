#!/bin/bash

# Start GenCrest with Docker Compose (without nginx)

echo "🚀 Starting GenCrest services..."

# Create required directories
mkdir -p uploads logs

# Start services
docker compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Check status
echo "📊 Service status:"
docker compose ps

echo "✅ Services started!"
echo "🔗 API available at: http://localhost:3001"
echo "📝 Setup nginx externally to proxy to port 3001"
