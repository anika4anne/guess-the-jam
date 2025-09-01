# 🧪 Local Multiplayer Testing Guide

This guide will help you test the new WebSocket multiplayer system locally with two browser tabs.

## 🚀 **Step 1: Start the WebSocket Server**

Open a terminal and run:

```bash
npm run production
```

You should see:

```
🎮 Production Game Server running on 0.0.0.0:3001
🌐 Health check available at http://0.0.0.0:3001/health
🔌 WebSocket endpoint: ws://0.0.0.0:3001
```

## 🌐 **Step 2: Test Server Health**

Open your browser and go to:

```
http://localhost:3001/health
```

You should see a JSON response with server status.

## 🎮 **Step 3: Test Multiplayer with Two Browser Tabs**

### **Tab 1: Create/Join Room**

1. Go to your game's private room creation page
2. Create a room with:
   - Room ID: `test-room-123`
   - Player Name: `Alice`
   - Game Mode: `default`
   - Rounds: `3`
   - Year: `2020`

### **Tab 2: Join the Same Room**

1. Go to your game's join room page
2. Join room `test-room-123` with player name `Bob`

### **Expected Behavior**

- Both tabs should show the same room
- Both players should see each other
- Alice should be the host
- Both should be able to mark themselves as "Ready"

## 🔍 **Step 4: Monitor WebSocket Messages**

Open browser DevTools (F12) in both tabs and check the Console tab.

You should see messages like:

```
🎮 Connecting to game server: ws://localhost:3001?roomId=test-room-123&name=Alice
🎮 Connected to game server successfully!
🎮 Game message received: {type: "room_joined", ...}
🎮 Game message received: {type: "player_joined", ...}
```

## 🎯 **Step 5: Test Game Flow**

1. **In Tab 1 (Alice - Host)**:

   - Mark yourself as "Ready"
   - Wait for Bob to be ready
   - Click "Start Game"

2. **In Tab 2 (Bob)**:

   - Mark yourself as "Ready"
   - Watch for game start countdown

3. **Both tabs should see**:
   - Countdown: "Starting in 5 seconds"
   - Game transition to gameplay

## 📝 **Step 6: Test Answer Submission**

1. **In Tab 1 (Alice)**:

   - Submit an answer for the song
   - Watch for "Answer Submitted!" message

2. **In Tab 2 (Bob)**:

   - Submit an answer for the song
   - Watch for "Answer Submitted!" message

3. **Both tabs should see**:
   - All answers displayed
   - Round results
   - Next round button (if host)

## 🚨 **Troubleshooting**

### **Server Won't Start**

```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Try again
npm run production
```

### **WebSocket Connection Fails**

1. Check server is running: `http://localhost:3001/health`
2. Verify environment variable: `NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001`
3. Check browser console for errors

### **Players Can't See Each Other**

1. Verify both players are in the same room ID
2. Check WebSocket connection status in both tabs
3. Look for error messages in browser console

## ✅ **Success Indicators**

- ✅ Both tabs show the same room
- ✅ Players can see each other
- ✅ Ready status updates in real-time
- ✅ Game starts when all players ready
- ✅ Answers sync between tabs
- ✅ No localStorage errors in console
- ✅ WebSocket messages flowing

## 🔄 **What We've Replaced**

### **Before (localStorage)**

```typescript
// Polling every 500ms
const interval = setInterval(() => {
  const stored = localStorage.getItem(key);
  if (stored) {
    const parsed = JSON.parse(stored);
    setAllAnswers(parsed);
  }
}, 500);

// Manual storage
localStorage.setItem(key, JSON.stringify(answers));
```

### **After (WebSocket)**

```typescript
// Real-time updates via WebSocket
useEffect(() => {
  if (wsMessage?.type === "answer_submitted") {
    setAllAnswers(wsMessage.answers);
  }
}, [wsMessage]);

// Automatic server sync
submitAnswer(answer);
```

## 🎉 **You're Ready for Multi-Device!**

Once this local test works, you can:

1. **Deploy to Raspberry Pi** for network-wide access
2. **Test with real devices** (phones, tablets, laptops)
3. **Scale to multiple rooms** and players

Happy testing! 🎮✨
