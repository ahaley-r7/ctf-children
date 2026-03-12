#!/bin/bash
# Easy deployment script for CTF app

echo "🚀 Deploying CTF Application..."

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Rebuild and start
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "📝 View logs with: docker-compose logs -f"
echo "🔄 Restart with: docker-compose restart"
echo "🛑 Stop with: docker-compose down"
