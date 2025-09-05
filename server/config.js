"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    websocket: {
        port: process.env.WEBSOCKET_PORT
            ? parseInt(process.env.WEBSOCKET_PORT)
            : 3001,
        host: process.env.WEBSOCKET_HOST || "0.0.0.0",
        url: process.env.WEBSOCKET_URL ||
            "ws://".concat(process.env.WEBSOCKET_HOST || "0.0.0.0", ":").concat(process.env.WEBSOCKET_PORT || 3001),
    },
    webhook: {
        secret: process.env.WEBHOOK_SECRET ||
            "your-super-secret-webhook-key-change-this-in-production",
    },
    game: {
        maxPlayersPerRoom: process.env.MAX_PLAYERS_PER_ROOM
            ? parseInt(process.env.MAX_PLAYERS_PER_ROOM)
            : 10,
        maxRooms: process.env.MAX_ROOMS ? parseInt(process.env.MAX_ROOMS) : 100,
        gameTimeoutSeconds: process.env.GAME_TIMEOUT_SECONDS
            ? parseInt(process.env.GAME_TIMEOUT_SECONDS)
            : 300,
    },
    isDevelopment: process.env.NODE_ENV === "development",
    server: {
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true,
        },
    },
};
