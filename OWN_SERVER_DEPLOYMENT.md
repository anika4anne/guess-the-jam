# 🎮 Deploy Your Own Game Server (Complete Guide)

This guide will help you set up your computer as a game server that anyone can connect to from anywhere!

## ✨ **What You'll Get:**

- ✅ **Your computer** becomes the game server
- ✅ **Anyone can play** from any device, anywhere
- ✅ **No WiFi limitations** - works over the internet
- ✅ **Complete control** over your server
- ✅ **Professional setup** like commercial game servers

## 🚀 **Step 1: Start Your Server**

### **Quick Start:**
```bash
./start-server.sh
```

### **Manual Start:**
```bash
pnpm build:standalone
pnpm start:standalone
```

## 🌐 **Step 2: Make It Accessible Online**

### **Option A: Port Forwarding (Recommended)**

1. **Find your router's IP address:**
   ```bash
   # On Mac/Linux
   netstat -nr | grep default
   
   # On Windows
   ipconfig
   ```

2. **Access your router:**
   - Open browser and go to your router's IP (usually `192.168.1.1` or `10.0.0.1`)
   - Login with your router password

3. **Set up port forwarding:**
   - Find "Port Forwarding" or "Virtual Server"
   - Add new rule:
     - **External Port**: `3001`
     - **Internal Port**: `3001`
     - **Protocol**: TCP
     - **Internal IP**: Your computer's IP address

### **Option B: Use ngrok (Temporary, for testing)**

1. **Install ngrok:**
   ```bash
   # On Mac
   brew install ngrok
   
   # Or download from ngrok.com
   ```

2. **Create tunnel:**
   ```bash
   ngrok http 3001
   ```

3. **Use the ngrok URL** for testing

## 🏷️ **Step 3: Get a Free Domain**

### **Option 1: No-IP (Recommended)**
1. Go to [noip.com](https://noip.com)
2. Sign up for free account
3. Create a hostname (like `yourgame.ddns.net`)
4. Download and install No-IP client on your computer

### **Option 2: DuckDNS**
1. Go to [duckdns.org](https://duckdns.org)
2. Sign up with GitHub
3. Create a subdomain (like `yourgame.duckdns.org`)

## 🔧 **Step 4: Update Your Frontend**

Once you have your external URL, update your `.env.local`:
```bash
NEXT_PUBLIC_WEBSOCKET_URL=ws://yourgame.ddns.net:3001
```

## 🧪 **Step 5: Test Multi-Device Play**

1. **Start your server:** `./start-server.sh`
2. **Open your game** on one device
3. **Create a private room**
4. **Open on another device** (or share with friends)
5. **Join the room** using the room ID
6. **Multi-device multiplayer should work!** 🎉

## 🛡️ **Security Notes:**

- ✅ **Your personal data is safe** - players can only access the game
- ✅ **Port forwarding** only opens the game port
- ✅ **Firewall protection** blocks other access
- ✅ **Standard security** used by millions

## 💰 **Cost:**

- **Your computer**: Already owned
- **Port forwarding**: Free (router feature)
- **Dynamic DNS**: Free tier available
- **Total cost**: $0! 🎉

## 🎯 **Next Steps:**

1. **Start your server:** `./start-server.sh`
2. **Set up port forwarding** on your router
3. **Get a free domain** (No-IP or DuckDNS)
4. **Test from other devices**
5. **Enjoy multi-device multiplayer!**

---

**Ready to make your computer a game server?** This will give you professional-grade multiplayer that works from anywhere! 🚀
