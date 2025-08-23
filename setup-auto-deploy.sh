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

echo "📋 Step 1: Setting up Vercel (Frontend)"
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
echo "🔑 Step 2: Getting Vercel Tokens"
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
echo "🏢 Step 3: Getting Vercel Project Details"
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
echo "🔧 Step 4: Manual Deployment Setup"
echo "You now have all the necessary tokens and IDs to deploy manually:"
echo ""

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
echo "1. Deploy your frontend to Vercel:"
echo "   vercel --prod"
echo "2. Your game will be available at your Vercel URL!"
echo ""
echo "🚀 To test:"
echo "1. Deploy to Vercel using the command above"
echo "2. Wait for deployment to complete"
echo "3. Your game will be available at your Vercel URL!"
echo ""
echo "💡 Pro tip: You can also use Vercel's GitHub integration for automatic deployments"
echo ""
echo "🔧 If you need to update tokens later:"
echo "Re-run this setup script or update them manually in your Vercel dashboard"
