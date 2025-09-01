#!/bin/bash

echo "🚀 Setting up 24/7 Game Server on Raspberry Pi..."

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "⚠️  This script is designed for Raspberry Pi deployment"
    echo "   For local testing, use: npm run start:server"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
echo "📥 Installing PM2 process manager..."
sudo npm install -g pm2

# Navigate to project directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Build the server
echo "🔨 Building production server..."
npm run build:server

# Create logs directory
mkdir -p logs

# Start server with PM2
echo "🚀 Starting game server with PM2..."
pm2 start dist/index.js --name "guess-the-jam-server" --env production

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup auto-start on boot
echo "🔄 Setting up auto-start on boot..."
pm2 startup

echo ""
echo "✅ 24/7 Game Server Setup Complete!"
echo ""
echo "🌐 Server Status:"
pm2 status
echo ""
echo "📊 Monitor server: pm2 monit"
echo "📝 View logs: pm2 logs guess-the-jam-server"
echo "🔄 Restart server: pm2 restart guess-the-jam-server"
echo "⏹️  Stop server: pm2 stop guess-the-jam-server"
echo ""
echo "🔌 WebSocket endpoint: ws://YOUR_PI_IP:3001"
echo "🌐 Health check: http://YOUR_PI_IP:3001/health"
echo ""
echo "🎮 Your game server will now run 24/7 and restart automatically!"
