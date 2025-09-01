#!/bin/bash

echo "🚀 Deploying Guess The Jam Game Server to Raspberry Pi..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "📖 Visit: https://docs.docker.com/engine/install/debian/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "📖 Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Get Raspberry Pi IP address
echo "🔍 Detecting Raspberry Pi IP address..."
RASPBERRY_PI_IP=$(hostname -I | awk '{print $1}')
echo "📍 Detected IP: $RASPBERRY_PI_IP"

# Create production environment file
echo "📝 Creating production environment file..."
cat > .env.production << EOF
# Production Environment Variables for Raspberry Pi Game Server

# WebSocket Server Configuration
WEBSOCKET_HOST=0.0.0.0
WEBSOCKET_PORT=3001
WEBSOCKET_URL=ws://$RASPBERRY_PI_IP:3001

# CORS Configuration
CORS_ORIGIN=*

# Game Settings
MAX_PLAYERS_PER_ROOM=10
MAX_ROOMS=100
GAME_TIMEOUT_SECONDS=300

# Security
WEBHOOK_SECRET=your-super-secret-webhook-key-change-this-in-production

# Environment
NODE_ENV=production
EOF

echo "✅ Environment file created with IP: $RASPBERRY_PI_IP"

# Build and start the game server
echo "🔨 Building and starting game server..."
docker-compose -f docker-compose.game-server.yml up --build -d

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Check if server is running
if curl -s "http://localhost:3001/health" > /dev/null; then
    echo "✅ Game server is running successfully!"
    echo "🌐 Health check: http://$RASPBERRY_PI_IP:3001/health"
    echo "🔌 WebSocket endpoint: ws://$RASPBERRY_PI_IP:3001"
    echo ""
    echo "📱 Players can now connect from any device using:"
    echo "   WebSocket URL: ws://$RASPBERRY_PI_IP:3001"
    echo ""
    echo "🔧 To view logs: docker-compose -f docker-compose.game-server.yml logs -f"
    echo "🛑 To stop server: docker-compose -f docker-compose.game-server.yml down"
else
    echo "❌ Server failed to start. Check logs with:"
    echo "   docker-compose -f docker-compose.game-server.yml logs"
    exit 1
fi
