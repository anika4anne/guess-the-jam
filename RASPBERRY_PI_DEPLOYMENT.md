# 🍓 Raspberry Pi Deployment Guide for Guess The Jam

This guide will help you deploy your multiplayer game server on a Raspberry Pi so players can join from different devices.

## 🎯 What This Setup Achieves

- **Multi-device multiplayer**: Players can join from phones, tablets, laptops, etc.
- **Real-time gameplay**: WebSocket server syncs game state between all players
- **Persistent rooms**: Game rooms persist even if players disconnect/reconnect
- **Scalable**: Can handle multiple rooms with multiple players

## 📋 Prerequisites

- Raspberry Pi (3 or 4 recommended)
- Raspberry Pi OS (latest version)
- Internet connection
- Basic command line knowledge

## 🚀 Quick Start (Automated)

1. **Clone your project to Raspberry Pi**:
   ```bash
   git clone <your-repo-url>
   cd guess-the-jam
   ```

2. **Run the automated deployment script**:
   ```bash
   ./deploy-raspberry-pi.sh
   ```

3. **That's it!** The script will:
   - Install Docker if needed
   - Build the game server
   - Start the server
   - Show you the connection details

## 🔧 Manual Setup (Step by Step)

### Step 1: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

### Step 2: Install Docker Compose

```bash
# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Deploy Game Server

```bash
# Navigate to project directory
cd guess-the-jam

# Build and start server
docker-compose -f docker-compose.game-server.yml up --build -d

# Check if server is running
curl http://localhost:3001/health
```

### Step 4: Get Your Raspberry Pi IP

```bash
# Find your IP address
hostname -I
```

## 🌐 Connecting from Other Devices

### For Players on Same Network

Players can connect using your Raspberry Pi's local IP address:
- **WebSocket URL**: `ws://YOUR_PI_IP:3001`
- **Example**: `ws://192.168.1.100:3001`

### For Players on Different Networks (Port Forwarding)

1. **Access your router settings** (usually `192.168.1.1`)
2. **Set up port forwarding**:
   - External Port: `3001`
   - Internal Port: `3001`
   - Internal IP: Your Raspberry Pi's IP
   - Protocol: TCP
3. **Players connect using your public IP**: `ws://YOUR_PUBLIC_IP:3001`

## 📱 Frontend Configuration

Update your frontend to connect to the Raspberry Pi server:

```typescript
// In your useWebSocket hook or wherever you connect
const wsUrl = `ws://YOUR_PI_IP:3001?roomId=${roomId}&name=${playerName}`;
```

Or use environment variables:

```bash
# Create .env.local in your frontend project
NEXT_PUBLIC_WEBSOCKET_URL=ws://YOUR_PI_IP:3001
```

## 🔍 Monitoring and Maintenance

### View Server Logs

```bash
# Follow logs in real-time
docker-compose -f docker-compose.game-server.yml logs -f

# View recent logs
docker-compose -f docker-compose.game-server.yml logs
```

### Check Server Status

```bash
# Health check
curl http://YOUR_PI_IP:3001/health

# Container status
docker ps
```

### Restart Server

```bash
# Restart the server
docker-compose -f docker-compose.game-server.yml restart

# Or rebuild and restart
docker-compose -f docker-compose.game-server.yml up --build -d
```

### Stop Server

```bash
# Stop the server
docker-compose -f docker-compose.game-server.yml down
```

## 🚨 Troubleshooting

### Server Won't Start

```bash
# Check if port is in use
sudo netstat -tulpn | grep :3001

# Kill process using port 3001
sudo kill -9 <PID>

# Check Docker logs
docker-compose -f docker-compose.game-server.yml logs
```

### Can't Connect from Other Devices

1. **Check firewall**: Ensure port 3001 is open
2. **Verify IP address**: Make sure you're using the correct IP
3. **Test connectivity**: Try `ping YOUR_PI_IP` from other devices
4. **Check router settings**: Ensure no blocking rules

### Performance Issues

1. **Monitor resource usage**:
   ```bash
   htop
   docker stats
   ```

2. **Limit concurrent connections** in `.env.production`:
   ```bash
   MAX_PLAYERS_PER_ROOM=8
   MAX_ROOMS=50
   ```

## 🔒 Security Considerations

1. **Change default secrets** in `.env.production`
2. **Use HTTPS/WSS** for production (requires SSL certificate)
3. **Implement rate limiting** if needed
4. **Regular security updates**: `sudo apt update && sudo apt upgrade`

## 📈 Scaling Up

### Multiple Game Servers

You can run multiple instances on different ports:

```yaml
# docker-compose.scaled.yml
version: '3.8'
services:
  game-server-1:
    build: .
    ports: ["3001:3001"]
    environment:
      - WEBSOCKET_PORT=3001
  
  game-server-2:
    build: .
    ports: ["3002:3001"]
    environment:
      - WEBSOCKET_PORT=3001
```

### Load Balancing

Consider using Nginx or HAProxy for load balancing multiple game servers.

## 🎮 Testing Your Setup

1. **Start the server** on Raspberry Pi
2. **Open your game** on multiple devices
3. **Create a private room** on one device
4. **Join the room** from other devices using the room code
5. **Verify real-time updates** work across all devices

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify network connectivity
3. Ensure Docker is running: `sudo systemctl status docker`
4. Check port availability: `netstat -tulpn | grep :3001`

## 🎉 You're All Set!

Your multiplayer game server is now running on Raspberry Pi! Players can join from any device on your network (or from the internet if you set up port forwarding).

Happy gaming! 🎮✨
