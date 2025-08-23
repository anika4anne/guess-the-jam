# 🚀 Automatic Deployment Setup

Your game will now deploy automatically every time you push code to GitHub!

## ✨ What This Gives You

- **No more manual deployment scripts**
- **Game always available online**
- **Automatic updates when you push code**
- **Play on any device, anywhere**

## 🎯 One-Time Setup (5 minutes)

### 1. Run the Setup Script

```bash
./setup-auto-deploy.sh
```

This script will guide you through:

- Creating Render account (WebSocket server)
- Creating Vercel account (Frontend)
- Getting API tokens
- Setting up GitHub secrets

### 2. Push Your Code

```bash
git add .
git commit -m "Setup automatic deployment"
git push origin main
```

## 🔄 How It Works

1. **You push code to GitHub** → `git push origin main`
2. **GitHub Actions automatically runs** → Deploys both servers
3. **Your game is updated online** → Available to play immediately

## 📱 After Setup

- **Local development**: Still works with `pnpm dev:full`
- **Online play**: Always available at your Vercel URL
- **Multi-device**: Works on any device with internet
- **No scripts needed**: Everything happens automatically

## 🆘 If Something Goes Wrong

- Check the **Actions** tab in your GitHub repo
- Look for any error messages
- The deployment will retry automatically
- You can manually trigger deployment from the Actions tab

## 💰 Cost

- **Render**: Free tier available
- **Vercel**: Free tier available

- **Total**: Can be completely free!

## 🎮 Ready to Play!

Once setup is complete:

1. Share your Vercel URL with friends
2. Create private rooms from any device
3. Play together from anywhere in the world
4. No more "same WiFi" limitations!

---

**Need help?** Check the Actions tab in your GitHub repo for deployment status and any error messages.
