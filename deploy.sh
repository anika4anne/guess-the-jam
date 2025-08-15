#!/bin/bash

echo "🚀 Deploying Guess The Jam for Multi-Device Play!"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Prerequisites:"
echo "1. Make sure you have Railway CLI installed (npm i -g @railway/cli)"
echo "2. Make sure you have Vercel CLI installed (npm i -g vercel)"
echo "3. Make sure you're logged into both services"
echo ""

read -p "Have you completed the prerequisites? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the prerequisites first and run this script again."
    exit 1
fi

echo ""
echo "🔧 Step 1: Building WebSocket server..."
pnpm build:websocket

if [ $? -ne 0 ]; then
    echo "❌ Failed to build WebSocket server"
    exit 1
fi

echo "✅ WebSocket server built successfully"

echo ""
echo "🌐 Step 2: Deploying WebSocket server to Railway..."
railway up

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy to Railway"
    echo "Please deploy manually following the DEPLOYMENT.md guide"
    exit 1
fi

echo "✅ WebSocket server deployed to Railway"

echo ""
echo "🔗 Step 3: Getting Railway URL..."
RAILWAY_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

if [ -z "$RAILWAY_URL" ]; then
    echo "⚠️  Could not automatically get Railway URL"
    echo "Please get it manually from your Railway dashboard"
    read -p "Enter your Railway URL (without https://): " RAILWAY_URL
fi

echo "✅ Railway URL: $RAILWAY_URL"

echo ""
echo "📝 Step 4: Creating environment file..."
cat > .env.local << EOF
NEXT_PUBLIC_WEBSOCKET_URL=wss://$RAILWAY_URL
EOF

echo "✅ Environment file created"

echo ""
echo "🌍 Step 5: Deploying frontend to Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy to Vercel"
    echo "Please deploy manually following the DEPLOYMENT.md guide"
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📱 Your game is now playable on multiple devices!"
echo "🌐 Frontend URL: Check your Vercel dashboard"
echo "🔌 WebSocket URL: wss://$RAILWAY_URL"
echo ""
echo "💡 To test:"
echo "1. Open your Vercel URL on one device"
echo "2. Create a private room"
echo "3. Open the same URL on another device"
echo "4. Join the room using the room ID"
echo ""
echo "🔧 If you need to update environment variables in Vercel:"
echo "Go to your Vercel dashboard → Project Settings → Environment Variables"
echo "Add: NEXT_PUBLIC_WEBSOCKET_URL = wss://$RAILWAY_URL"
