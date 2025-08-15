#!/bin/bash

echo "🚀 Starting Guess The Jam development servers..."

# Start WebSocket server in background
echo "📡 Starting WebSocket server on port 3001..."
pnpm run websocket &

# Wait a moment for WebSocket server to start
sleep 2

# Start Next.js development server
echo "🌐 Starting Next.js development server on port 3000..."
pnpm run dev

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    pkill -f "tsx server/websocket.ts"
    pkill -f "next dev"
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup SIGINT

# Wait for background processes
wait
