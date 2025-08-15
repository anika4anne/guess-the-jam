#!/bin/bash

echo "🚀 Setting up Automatic Deployment for Guess The Jam!"
echo "This script will configure your project for automatic deployment."
echo "You only need to run this ONCE!"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Step 1: Setting up Railway (WebSocket Server)"
echo "1. Go to https://railway.app and sign up/login"
echo "2. Create a new project"
echo "3. Connect your GitHub repository"
echo "4. Copy your Railway token from your account settings"
echo ""

read -p "Have you created a Railway project? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create a Railway project first and run this script again."
    exit 1
fi

echo ""
echo "🔑 Step 2: Getting Railway Token"
echo "1. Go to Railway dashboard → Account → Tokens"
echo "2. Create a new token"
echo "3. Copy the token"
echo ""

read -s -p "Enter your Railway token: " RAILWAY_TOKEN
echo

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Railway token is required"
    exit 1
fi

echo ""
echo "🌐 Step 3: Setting up Vercel (Frontend)"
echo "1. Go to https://vercel.com and sign up/login"
echo "2. Create a new project"
echo "3. Connect your GitHub repository"
echo "4. Deploy once to get your project ID"
echo ""

read -p "Have you created a Vercel project? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create a Vercel project first and run this script again."
    exit 1
fi

echo ""
echo "🔑 Step 4: Getting Vercel Tokens"
echo "1. Go to Vercel dashboard → Settings → Tokens"
echo "2. Create a new token"
echo "3. Copy the token"
echo ""

read -s -p "Enter your Vercel token: " VERCEL_TOKEN
echo

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Vercel token is required"
    exit 1
fi

echo ""
echo "🏢 Step 5: Getting Vercel Project Details"
echo "1. Go to your Vercel project dashboard"
echo "2. Go to Settings → General"
echo "3. Copy your Project ID and Org ID"
echo ""

read -p "Enter your Vercel Project ID: " VERCEL_PROJECT_ID
read -p "Enter your Vercel Org ID: " VERCEL_ORG_ID

if [ -z "$VERCEL_PROJECT_ID" ] || [ -z "$VERCEL_ORG_ID" ]; then
    echo "❌ Vercel Project ID and Org ID are required"
    exit 1
fi

echo ""
echo "🔧 Step 6: Setting up GitHub Secrets"
echo "1. Go to your GitHub repository"
echo "2. Go to Settings → Secrets and variables → Actions"
echo "3. Add the following secrets:"
echo ""

echo "RAILWAY_TOKEN = $RAILWAY_TOKEN"
echo "VERCEL_TOKEN = $VERCEL_TOKEN"
echo "VERCEL_PROJECT_ID = $VERCEL_PROJECT_ID"
echo "VERCEL_ORG_ID = $VERCEL_ORG_ID"

echo ""
echo "📝 Step 7: Creating environment file for local development"
cat > .env.local << EOF
# Local development - will be overridden in production
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
EOF

echo "✅ Environment file created for local development"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📱 What happens now:"
echo "1. Every time you push code to the 'main' branch"
echo "2. GitHub Actions will automatically:"
echo "   - Deploy your WebSocket server to Railway"
echo "   - Deploy your frontend to Vercel"
echo "3. Your game will always be available online!"
echo ""
echo "🚀 To test:"
echo "1. Push some code to GitHub: git push origin main"
echo "2. Check the Actions tab in your GitHub repo"
echo "3. Wait for deployment to complete"
echo "4. Your game will be available at your Vercel URL!"
echo ""
echo "💡 Pro tip: You can also manually trigger deployment from the Actions tab"
echo ""
echo "🔧 If you need to update secrets later:"
echo "Go to GitHub → Settings → Secrets and variables → Actions"
