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

echo "📋 Step 1: Setting up Render (WebSocket Server)"
echo "1. Go to https://render.com and sign up/login"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Copy your Render API key from your account settings"
echo ""

read -p "Have you created a Render project? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create a Render project first and run this script again."
    exit 1
fi

echo ""
echo "🔑 Step 2: Getting Render API Key"
echo "1. Go to Render dashboard → Account → API Keys"
echo "2. Create a new API key"
echo "3. Copy the API key"
echo ""

read -s -p "Enter your Render API key: " RENDER_API_KEY
echo

if [ -z "$RENDER_API_KEY" ]; then
    echo "❌ Render API key is required"
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
echo "🔧 Step 6: Manual Deployment Setup"
echo "You now have all the necessary tokens and IDs to deploy manually:"
echo ""

echo "RENDER_API_KEY = $RENDER_API_KEY"
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
echo "📱 What to do next:"
echo "1. Use the deploy.sh script to deploy manually:"
echo "   ./deploy.sh"
echo "2. Or deploy each service individually:"
echo "   - WebSocket server to Render using: render deploy"
echo "   - Frontend to Vercel using: vercel --prod"
echo ""
echo "🚀 To test:"
echo "1. Run the deploy.sh script"
echo "2. Wait for both deployments to complete"
echo "3. Your game will be available at your Vercel URL!"
echo ""
echo "💡 Pro tip: You can also deploy each service separately for more control"
echo ""
echo "🔧 If you need to update tokens later:"
echo "Re-run this setup script or update them manually in your deployment services"
