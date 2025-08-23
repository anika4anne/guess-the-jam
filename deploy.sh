#!/bin/bash

echo "🚀 Deploying Guess The Jam to Vercel!"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Prerequisites:"
echo "1. Make sure you have Vercel CLI installed (npm i -g vercel)"
echo "2. Make sure you're logged into Vercel"
echo ""

read -p "Have you completed the prerequisites? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the prerequisites first and run this script again."
    exit 1
fi

echo ""
echo "🔧 Step 1: Building frontend..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi

echo "✅ Frontend built successfully"

echo ""
echo "🌍 Step 2: Deploying frontend to Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy to Vercel"
    echo "Please deploy manually following the DEPLOYMENT.md guide"
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📱 Your game is now deployed!"
echo "🌐 Frontend URL: Check your Vercel dashboard"
echo ""
echo "💡 To test:"
echo "1. Open your Vercel URL on one device"
echo "2. Create a private room"
echo "3. Open the same URL on another device"
echo "4. Join the room using the room ID"
echo ""
echo "🔧 If you need to update environment variables in Vercel:"
echo "Go to your Vercel dashboard → Project Settings → Environment Variables"
