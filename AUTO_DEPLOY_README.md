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

- Creating Vercel account (Frontend)
- Getting API tokens
- Setting up deployment configuration

### 2. Push Your Code

```bash
git add .
git commit -m "Setup automatic deployment"
git push origin main
```

## 🔄 How It Works

1. **You run the deploy script** → `./deploy.sh`
2. **Vercel automatically deploys** → Your frontend is updated
3. **Your game is available online** → Ready to play immediately

## 📱 After Setup

- **Local development**: Still works with `pnpm dev`
- **Online play**: Available at your Vercel URL
- **Multi-device**: Works on any device with internet
- **Simple deployment**: Just run `./deploy.sh` when you want to update

## 🆘 If Something Goes Wrong

- Check your **Vercel dashboard** for deployment status
- Look for any error messages in the deployment logs
- You can redeploy by running `./deploy.sh` again
- Check the Vercel documentation for troubleshooting

## 💰 Cost

- **Vercel**: Free tier available
- **Total**: Can be completely free!

## 🎮 Ready to Play!

Once setup is complete:

1. Share your Vercel URL with friends
2. Create private rooms from any device
3. Play together from anywhere in the world
4. No more "same WiFi" limitations!

---

**Need help?** Check your Vercel dashboard for deployment status and any error messages.
