#!/bin/bash

echo "🎮 Starting Guess The Jam Game Server..."

if pgrep -f "standalone-server" > /dev/null; then
    echo "⚠️  Server is already running!"
    echo "To stop it: pkill -f 'standalone-server'"
    exit 1
fi

echo "🔨 Building server..."
pnpm build:standalone

echo "🚀 Starting server on port 3001..."
pnpm start:standalone &

sleep 3

if pgrep -f "standalone-server" > /dev/null; then
    echo "✅ Server started successfully!"
    echo "🌐 Health check: http://localhost:3001/"
    echo "🔌 WebSocket: ws://localhost:3001"
    echo ""
    echo "📱 To make this accessible from other devices:"
    echo "1. Set up port forwarding on your router (port 3001)"
    echo "2. Get a free domain (like No-IP or DuckDNS)"
    echo "3. Update your frontend to use the external URL"
    echo ""
    echo "🛑 To stop server: pkill -f 'standalone-server'"
else
    echo "❌ Failed to start server"
    exit 1
fi
