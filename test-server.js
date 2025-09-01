#!/usr/bin/env node

const WebSocket = require('ws');

console.log('🧪 Testing WebSocket Server Connection...\n');

// Test configuration
const SERVER_URL = process.env.TEST_SERVER_URL || 'ws://localhost:3001';
const ROOM_ID = 'test-room-' + Date.now();
const PLAYER_NAME = 'TestPlayer';

console.log(`📍 Server URL: ${SERVER_URL}`);
console.log(`🏠 Room ID: ${ROOM_ID}`);
console.log(`👤 Player Name: ${PLAYER_NAME}\n`);

// Create WebSocket connection
const ws = new WebSocket(`${SERVER_URL}?roomId=${ROOM_ID}&name=${PLAYER_NAME}`);

ws.on('open', () => {
  console.log('✅ Connected to server successfully!');
  
  // Test sending a message
  const testMessage = {
    type: 'player_ready',
    ready: true
  };
  
  console.log('📤 Sending test message:', testMessage);
  ws.send(JSON.stringify(testMessage));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📨 Received message:', message);
    
    // Check if we got the expected response
    if (message.type === 'room_joined') {
      console.log('🎉 Successfully joined room!');
      console.log('✅ Server is working correctly!');
      
      // Close connection after successful test
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

ws.on('close', (code, reason) => {
  console.log(`🔌 Connection closed: ${code} - ${reason}`);
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - server may not be responding');
  ws.close();
  process.exit(1);
}, 10000);

console.log('⏳ Waiting for server response...\n');
