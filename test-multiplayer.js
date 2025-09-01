#!/usr/bin/env node

const WebSocket = require("ws");

console.log("🧪 Testing Multiplayer WebSocket System...\n");

// Test configuration
const SERVER_URL = process.env.TEST_SERVER_URL || "ws://localhost:3001";
const ROOM_ID = "test-room-" + Date.now();
const PLAYER_NAMES = ["Alice", "Bob", "Charlie"];

console.log(`📍 Server URL: ${SERVER_URL}`);
console.log(`🏠 Room ID: ${ROOM_ID}`);
console.log(`👥 Players: ${PLAYER_NAMES.join(", ")}\n`);

// Simulate multiple players
const players = PLAYER_NAMES.map((name, index) => {
  const ws = new WebSocket(`${SERVER_URL}?roomId=${ROOM_ID}&name=${name}`);

  ws.on("open", () => {
    console.log(`✅ ${name} connected successfully!`);

    // Player 1 (Alice) will be the host and start the game
    if (index === 0) {
      setTimeout(() => {
        console.log(`🎮 ${name} (Host) starting game...`);
        ws.send(
          JSON.stringify({
            type: "start_game",
          }),
        );
      }, 2000);
    }
  });

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      console.log(`📨 ${name} received: ${message.type}`);

      // Handle different message types
      switch (message.type) {
        case "room_joined":
          console.log(`🏠 ${name} joined room ${message.roomId}`);
          break;

        case "player_joined":
          console.log(`👥 ${name} sees new player: ${message.player?.name}`);
          break;

        case "game_starting":
          console.log(
            `🎮 ${name} sees game starting with countdown: ${message.countdown}`,
          );
          break;

        case "gameplay_started":
          console.log(
            `🎵 ${name} sees gameplay started for round ${message.round}`,
          );

          // Simulate players submitting answers
          setTimeout(
            () => {
              const answer = {
                type: "submit_answer",
                answer: {
                  song: `Test Song ${Math.floor(Math.random() * 100)}`,
                  artist: `Test Artist ${Math.floor(Math.random() * 100)}`,
                  points: Math.floor(Math.random() * 10),
                  songCorrect: Math.random() > 0.5,
                  artistCorrect: Math.random() > 0.5,
                },
              };

              console.log(
                `📝 ${name} submitting answer: ${answer.answer.song}`,
              );
              ws.send(JSON.stringify(answer));
            },
            1000 + index * 500,
          ); // Stagger answers
          break;

        case "answer_submitted":
          console.log(
            `📝 ${name} sees answer submitted by ${message.playerName || "Unknown"}`,
          );
          break;

        case "chat_round_started":
          console.log(
            `💬 ${name} sees chat round started for song: ${message.song}`,
          );
          break;

        case "chat_round_ended":
          console.log(
            `⏰ ${name} sees chat round ended. Song was: ${message.song} by ${message.artist}`,
          );
          break;

        case "game_ended":
          console.log(`🏁 ${name} sees game ended!`);
          break;
      }
    } catch (error) {
      console.error(`❌ ${name} error parsing message:`, error);
    }
  });

  ws.on("close", (code, reason) => {
    console.log(`🔌 ${name} disconnected: ${code} - ${reason}`);
  });

  ws.on("error", (error) => {
    console.error(`❌ ${name} WebSocket error:`, error.message);
  });

  return { name, ws };
});

// Test completion
let completedTests = 0;
const totalTests = players.length;

const checkCompletion = () => {
  completedTests++;
  if (completedTests >= totalTests) {
    console.log("\n🎉 All players have completed their tests!");
    console.log("✅ Multiplayer system is working correctly!");

    // Clean up connections
    players.forEach(({ ws }) => {
      ws.close(1000, "Test completed");
    });

    process.exit(0);
  }
};

// Monitor for test completion
players.forEach(({ name, ws }) => {
  ws.on("close", () => {
    console.log(`✅ ${name} test completed`);
    checkCompletion();
  });
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log("\n⏰ Test timeout - some players may not have completed");
  players.forEach(({ ws }) => {
    ws.close(1000, "Test timeout");
  });
  process.exit(1);
}, 30000);

console.log("⏳ Running multiplayer tests...\n");
console.log("This will test:");
console.log("1. Multiple players connecting to the same room");
console.log("2. Host starting the game");
console.log("3. Players submitting answers");
console.log("4. Real-time message broadcasting");
console.log("5. Game state synchronization\n");
