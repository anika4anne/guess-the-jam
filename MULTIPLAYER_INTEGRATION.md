# 🎮 Multiplayer Integration Guide

This guide explains how to integrate your existing game with the new real-time multiplayer WebSocket system, replacing localStorage with server-synchronized game state.

## 🚀 **What's Been Created**

### 1. **Enhanced WebSocket Hook** (`useGameWebSocket`)

- **Real-time game state synchronization**
- **Automatic reconnection handling**
- **Game-specific message handling**
- **Answer submission and waiting**

### 2. **Multiplayer Game Component** (`MultiplayerGame`)

- **Replaces localStorage-based multiplayer**
- **Real-time answer synchronization**
- **Automatic round progression**
- **Host controls for game flow**

### 3. **Enhanced Server** (`production-server.ts`)

- **Game state storage and synchronization**
- **Answer collection and broadcasting**
- **Real-time room management**

## 🔄 **Migration from localStorage to WebSocket**

### **Before (localStorage)**

```typescript
// Old way - storing answers locally
const key = `room-${roomId}-answers-round-${round}`;
localStorage.setItem(key, JSON.stringify(answers));

// Polling for updates
const interval = setInterval(() => {
  const stored = localStorage.getItem(key);
  if (stored) {
    const parsed = JSON.parse(stored);
    setAllAnswers(parsed);
  }
}, 500);
```

### **After (WebSocket)**

```typescript
// New way - real-time synchronization
const { submitAnswer, waitForAllAnswers } = useGameWebSocket();

// Submit answer
submitAnswer({
  song: userSongAnswer,
  artist: userArtistAnswer,
  points: calculatedPoints,
  songCorrect: isSongCorrect,
  artistCorrect: isArtistCorrect,
});

// Wait for all answers automatically
const allAnswers = await waitForAllAnswers();
setAllAnswers(allAnswers);
```

## 📱 **How to Use the New System**

### **Step 1: Replace localStorage with WebSocket**

In your existing game components, replace localStorage usage:

```typescript
// OLD: Import localStorage-based hook
import { useWebSocket } from "~/hooks/useWebSocket";

// NEW: Import game-specific WebSocket hook
import { useGameWebSocket } from "~/hooks/useGameWebSocket";
```

### **Step 2: Update Hook Usage**

```typescript
// OLD
const { sendMessage, lastMessage, connect, disconnect } = useWebSocket();

// NEW
const {
  sendMessage,
  lastMessage,
  connect,
  disconnect,
  room,
  currentPlayerId,
  isHost,
  submitAnswer,
  waitForAllAnswers,
} = useGameWebSocket();
```

### **Step 3: Replace Answer Submission**

```typescript
// OLD: localStorage submission
const handleMultiplayerSubmit = (points, artistCorrect, songCorrect) => {
  const key = `room-${roomId}-answers-round-${round}`;
  const answer = {
    song: userSongAnswer,
    artist: userArtistAnswer,
    points,
    songCorrect,
    artistCorrect,
  };

  let answers = JSON.parse(localStorage.getItem(key) ?? "{}");
  answers[currentPlayerName] = answer;
  localStorage.setItem(key, JSON.stringify(answers));
};

// NEW: WebSocket submission
const handleMultiplayerSubmit = async (points, artistCorrect, songCorrect) => {
  const answer = {
    song: userSongAnswer,
    artist: userArtistAnswer,
    points,
    songCorrect,
    artistCorrect,
  };

  // Submit to server
  submitAnswer(answer);

  // Wait for all answers
  const allAnswers = await waitForAllAnswers();
  setAllAnswers(allAnswers);
};
```

### **Step 4: Replace Answer Polling**

```typescript
// OLD: Polling localStorage
useEffect(() => {
  const key = `room-${roomId}-answers-round-${round}`;
  const interval = setInterval(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      setAllAnswers(parsed);
    }
  }, 500);
  return () => clearInterval(interval);
}, [roomId, round]);

// NEW: WebSocket message handling
useEffect(() => {
  if (!lastMessage) return;

  if (lastMessage.type === "answer_submitted" && lastMessage.answers) {
    setAllAnswers(lastMessage.answers);

    // Check if all players have answered
    const validPlayers =
      room?.players.filter((p) => p.name.trim() !== "") || [];
    if (Object.keys(lastMessage.answers).length >= validPlayers.length) {
      setWaitingForOthers(false);
      setShowAllResults(true);
    }
  }
}, [lastMessage, room?.players]);
```

## 🎯 **Integration Examples**

### **Example 1: Basic Game Component**

```typescript
import { useGameWebSocket } from "~/hooks/useGameWebSocket";

export function MyGameComponent({ roomId, playerName }) {
  const {
    isConnected,
    room,
    submitAnswer,
    waitForAllAnswers
  } = useGameWebSocket();

  const handleSubmit = async () => {
    const answer = {
      song: userSongAnswer,
      artist: userArtistAnswer,
      points: calculatePoints(),
      songCorrect: checkSongCorrect(),
      artistCorrect: checkArtistCorrect()
    };

    // Submit to server
    submitAnswer(answer);

    // Wait for all answers
    const allAnswers = await waitForAllAnswers();
    console.log("All players have answered:", allAnswers);
  };

  if (!isConnected) {
    return <div>Connecting to game server...</div>;
  }

  return (
    <div>
      {/* Your game UI */}
      <button onClick={handleSubmit}>Submit Answer</button>
    </div>
  );
}
```

### **Example 2: Room Management**

```typescript
import { useGameWebSocket } from "~/hooks/useGameWebSocket";

export function RoomManager({ roomId, playerName }) {
  const {
    room,
    isHost,
    sendMessage
  } = useGameWebSocket();

  const startGame = () => {
    if (!isHost) return;

    sendMessage({
      type: "start_game"
    });
  };

  return (
    <div>
      <h2>Room: {room?.id}</h2>
      <p>Players: {room?.players.length}</p>
      {isHost && (
        <button onClick={startGame}>Start Game</button>
      )}
    </div>
  );
}
```

## 🔧 **Server Configuration**

### **Environment Variables**

Create a `.env.local` file in your frontend project:

```bash
# For local development
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# For Raspberry Pi deployment
NEXT_PUBLIC_WEBSOCKET_URL=ws://YOUR_PI_IP:3001
```

### **Server Startup**

```bash
# Development
npm run production

# Production (Raspberry Pi)
./deploy-raspberry-pi.sh
```

## 📊 **Message Types**

### **Client → Server**

- `player_ready` - Player ready status
- `start_game` - Host starts the game
- `game_settings_update` - Update game settings
- `submit_answer` - Submit player answer
- `chat_guess` - Submit chat guess
- `game_state_sync` - Synchronize game state

### **Server → Client**

- `room_joined` - Successfully joined room
- `player_joined` - New player joined
- `player_left` - Player left room
- `player_ready_update` - Player ready status changed
- `game_starting` - Game countdown started
- `gameplay_started` - Game round started
- `answer_submitted` - Player answer received
- `chat_round_started` - Chat round started
- `chat_round_ended` - Chat round ended
- `game_ended` - Game finished

## 🚨 **Common Issues & Solutions**

### **Connection Issues**

```typescript
// Check connection status
if (!isConnected) {
  return <div>Connecting to server...</div>;
}

// Handle reconnection
useEffect(() => {
  if (!isConnected) {
    connect(roomId, playerName);
  }
}, [isConnected, roomId, playerName, connect]);
```

### **Message Handling**

```typescript
// Always check message type
useEffect(() => {
  if (!lastMessage) return;

  switch (lastMessage.type) {
    case "answer_submitted":
      // Handle answer
      break;
    case "game_starting":
      // Handle game start
      break;
    default:
      console.log("Unknown message type:", lastMessage.type);
  }
}, [lastMessage]);
```

### **State Synchronization**

```typescript
// Sync room state when connected
useEffect(() => {
  if (room) {
    setCurrentRound(room.currentRound);
    setTotalRounds(room.totalRounds);
    setGamePhase(room.gamePhase);
  }
}, [room]);
```

## 🎮 **Testing Your Integration**

### **1. Start the Server**

```bash
npm run production
```

### **2. Test with Multiple Browser Tabs**

- Open your game in multiple tabs
- Create a room in one tab
- Join the room from other tabs
- Verify real-time synchronization

### **3. Test Answer Submission**

- Submit answers from different tabs
- Verify all players see the answers
- Check that rounds progress correctly

### **4. Test Disconnection/Reconnection**

- Close a tab and reopen
- Verify player reconnects properly
- Check that game state is preserved

## 🔄 **Migration Checklist**

- [ ] Replace `useWebSocket` with `useGameWebSocket`
- [ ] Update answer submission to use `submitAnswer()`
- [ ] Replace localStorage polling with WebSocket messages
- [ ] Update room state management
- [ ] Test multiplayer functionality
- [ ] Verify real-time synchronization
- [ ] Test disconnection/reconnection
- [ ] Deploy to production server

## 🎉 **Benefits of the New System**

1. **Real-time Updates** - No more polling or page refreshes
2. **Better Performance** - Efficient WebSocket communication
3. **Reliable Synchronization** - Server ensures all players see the same state
4. **Scalable** - Works across multiple devices and networks
5. **Persistent** - Game state survives disconnections
6. **Host Controls** - Proper host management and game flow control

## 📞 **Need Help?**

If you encounter issues during integration:

1. Check the browser console for WebSocket errors
2. Verify the server is running and accessible
3. Check environment variables are set correctly
4. Ensure all imports are updated
5. Test with the example page first

Your game is now ready for real-time multiplayer across any device! 🚀
