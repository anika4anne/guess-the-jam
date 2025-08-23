# 🎮 Standalone Server Guide (Like Among Us!)

Your game now has a **standalone server** that works just like Among Us - one central server that all players connect to!

## ✨ **What You Get:**

- ✅ **Simple deployment**
- ✅ **Simple, reliable server**
- ✅ **Works like Among Us** - one server, all players connect
- ✅ **Easy to deploy anywhere**

## 🚀 **Deployment Options:**

### **Option 1: Vercel (Recommended - Free)**

1. Go to [vercel.com](https://vercel.com) and sign up
2. Create **New Project**
3. Connect your GitHub repository
4. Deploy and note your URL

### **Option 2: DigitalOcean App Platform (Free Tier)**

1. Go to [digitalocean.com](https://digitalocean.com)
2. Create **App Platform** project
3. Connect your GitHub repository
4. **Build Command**: `pnpm install && pnpm build:standalone`
5. **Run Command**: `pnpm start:standalone`

### **Option 3: Your Own Server/VPS**

1. Upload your code to a VPS
2. Run: `pnpm install && pnpm build:standalone && pnpm start:standalone`
3. Open port 3001 (or whatever port you set)

## 🧪 **Test Locally First:**

```bash
# Build the standalone server
pnpm build:standalone

# Run it locally
pnpm start:standalone
```

**Test the health check:**

```bash
curl http://localhost:3001/
# Should show: 🎮 Guess The Jam Game Server is running!
```

## 🌐 **After Deployment:**

1. **Get your server URL** (e.g., `https://yourgame.vercel.app`)
2. **Update your frontend** to connect to it
3. **Test multi-device play!**

## 🔧 **Update Frontend Connection:**

Once deployed, update your `.env.local`:

```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://yourgame.vercel.app
```

## 💡 **Why This is Better:**

- **Simple deployment process**
- **Simple, reliable deployment**
- **Works exactly like Among Us**
- **Easy to scale and maintain**

## 🎯 **Next Steps:**

1. **Choose a hosting service** (Vercel recommended)
2. **Deploy the standalone server**
3. **Update frontend connection**
4. **Test multi-device multiplayer!**

---

**Ready to deploy your standalone server?** This will give you a reliable game server that works just like Among Us! 🎮
