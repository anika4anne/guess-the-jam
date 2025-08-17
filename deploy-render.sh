#!/bin/bash

echo "🚀 Deploying Guess The Jam to Render"
echo "====================================="

echo ""
echo "📋 Prerequisites:"
echo "1. Make sure you have a Render account at https://render.com"
echo "2. Ensure your code is pushed to your Git repository"
echo "3. Have your render.yaml file ready (already created)"

echo ""
echo "🔧 Steps to deploy:"
echo "1. Go to https://render.com and sign up/login"
echo "2. Click 'New +' and select 'Web Service'"
echo "3. Connect your Git repository"
echo "4. Render will automatically detect it's a Next.js app"
echo "5. Configure the service:"
echo "   - Name: guess-the-jam (or your preferred name)"
echo "   - Environment: Node"
echo "   - Build Command: pnpm install --frozen-lockfile && pnpm build"
echo "   - Start Command: pnpm start"
echo "   - Plan: Free (or choose a paid plan if needed)"
echo "6. Click 'Create Web Service'"

echo ""
echo "⏱️  First deployment will take 5-10 minutes"
echo "🌐 You'll get a URL like: https://your-app-name.onrender.com"

echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT.md"
echo "🔗 Render will automatically deploy on future pushes to your main branch"

echo ""
echo "✅ Setup complete! Follow the steps above to deploy to Render."
