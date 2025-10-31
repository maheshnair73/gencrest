#!/bin/bash

# Generate JWT Secret Key

echo "🔑 Generating JWT secret key..."
JWT_SECRET=$(openssl rand -hex 32)
echo "Generated JWT Secret: $JWT_SECRET"

# Update .env files
if [ -f .env ]; then
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    echo "✅ Updated .env"
fi

if [ -f .env.production ]; then
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production
    echo "✅ Updated .env.production"
fi

echo "🔒 JWT secret key updated in environment files"