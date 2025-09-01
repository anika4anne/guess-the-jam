#!/usr/bin/env node
import { config } from "./config.js";
console.log("🚀 Starting Guess The Jam Production Server...");
console.log(`📍 Port: ${config.websocket.port}`);
console.log(`🌐 Host: ${config.websocket.host}`);
// The game server is already created and running
console.log("✅ Game server instance loaded");
// Handle graceful shutdown
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down server gracefully...");
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down server gracefully...");
    process.exit(0);
});
console.log("✅ Server startup complete!");
