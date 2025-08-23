# 🎮 Multiplayer Setup Guide

## Overview

This guide explains how to set up and use the new WebSocket-based multiplayer system for Guess The Jam.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Servers

```bash
# Option A: Use the startup script (recommended)
./start-dev.sh

# Option B: Run manually in separate terminals
pnpm run websocket    # Terminal 1: WebSocket server (port 3001)
pnpm run dev          # Terminal 2: Next.js app (port 3000)
```

## 🔧 How It Works

### WebSocket Server (Port 3001)

- **Real-time communication** between players
- **Room management** with automatic host assignment
- **Player synchronization** for ready states, game start, etc.
- **Automatic cleanup** when players disconnect

### Next.js App (Port 3000)

- **Frontend interface** for the game
- **WebSocket client** connection management
- **Real-time updates** from the server

## 📡 WebSocket Messages

### Client → Server

```typescript

{ type: 'player_ready', ready: boolean }


{ type: 'start_game' }


{ type: 'game_settings_update', settings: any }


{ type: 'submit_answer', answer: any }


{ type: 'kick_player', targetPlayerId: string }
{ type: 'ban_player', targetPlayerId: string }
```

### Server → Client

```typescript

{ type: 'room_joined', roomId: string, playerId: string, room: RoomState }


{ type: 'player_joined', player: Player }
{ type: 'player_left', playerId: string, playerName: string }


{ type: 'player_ready_update', playerId: string, ready: boolean }
{ type: 'all_players_ready', canStart: boolean }


{ type: 'game_starting', countdown: number }
{ type: 'countdown_update', countdown: number }
{ type: 'gameplay_started', round: number, totalRounds: number }


{ type: 'new_host', hostId: string, hostName: string }


{ type: 'player_kicked', playerId: string, playerName: string }
{ type: 'player_banned', playerId: string }
```

## 🔗 Webhook Integration

### API Endpoint

```
POST /api/webhooks/game-events
```

### Request Body

```json
{
  "roomId": "room123",
  "event": "round_complete",
  "data": { "round": 1, "scores": {...} },
  "secret": "your-webhook-secret"
}
```

### Use Cases

- **External game events** (round completion, score updates)
- **Analytics tracking** (player behavior, game statistics)
- **Integration with other services** (Discord bots, Twitch overlays)

## 🌐 Global Multiplayer

### Current Setup

- **WebSocket server** runs on your local machine
- **Players connect** via `ws://localhost:3001`
- **Works globally** when deployed to a server

### Deployment Options

#### Option 1: Vercel + Render

```bash
# Deploy Next.js app to Vercel
vercel --prod

# Deploy WebSocket server to Render
render deploy
```

#### Option 2: DigitalOcean Droplet

```bash
# SSH into your droplet
ssh root@your-server-ip

# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2

# Clone and deploy
git clone https://github.com/your-username/guess-the-jam.git
cd guess-the-jam
pnpm install
pm2 start server/websocket.ts --name "game-server"
pm2 startup
pm2 save
```

#### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "websocket"]
```

## 🧪 Testing

### Local Testing

1. Start both servers
2. Open multiple browser tabs
3. Create/join rooms in different tabs
4. Test real-time updates

### Network Testing

1. Deploy to a server
2. Test from different devices/networks
3. Verify WebSocket connections work globally

## 🔒 Security Considerations

### Webhook Security

- **Always use HTTPS** in production
- **Rotate webhook secrets** regularly
- **Validate webhook payloads** before processing

### Rate Limiting

- **Implement rate limiting** on WebSocket connections
- **Limit message frequency** per player
- **Monitor for abuse** patterns

### Input Validation

- **Sanitize all player inputs**
- **Validate message types** and payloads
- **Implement timeout mechanisms** for inactive connections

## 🐛 Troubleshooting

### Common Issues

#### WebSocket Connection Failed

```bash
# Check if server is running
lsof -i :3001

# Check server logs
tail -f server.log
```

#### Players Not Syncing

- Verify WebSocket connection status
- Check browser console for errors
- Ensure both servers are running

#### Port Already in Use

```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Debug Mode

Enable debug logging by setting environment variables:

```bash
export DEBUG=websocket:*
export NODE_ENV=development
```

## 📚 API Reference

### WebSocket Server Methods

```typescript

gameServer.getRoomInfo(roomId: string): RoomState | null


gameServer.getAllRooms(): RoomSummary[]


gameServer.triggerWebhook(roomId: string, event: string, data: any): void
```

### Configuration Options

```typescript
export const config = {
  websocket: {
    port: 3001,
    host: "localhost",
  },
  game: {
    maxPlayersPerRoom: 10,
    maxRooms: 100,
    gameTimeoutSeconds: 300,
  },
};
```

## 🚀 Next Steps

1. **Test the system** locally with multiple browser tabs
2. **Deploy to a server** for global multiplayer
3. **Add more game features** (chat, spectator mode, etc.)
4. **Implement analytics** and monitoring
5. **Add authentication** and user accounts

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify both servers are running
3. Check the WebSocket server logs
4. Ensure ports are not blocked by firewall

---

**Happy Gaming! 🎵🎮**
