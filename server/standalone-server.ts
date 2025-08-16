import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { parse } from "url";
import express from "express";
import cors from "cors";

interface Player {
  id: string;
  name: string;
  ws: WebSocket;
  roomId: string;
  ready: boolean;
  score: number;
}

interface Room {
  id: string;
  hostId: string;
  players: Map<string, Player>;
  gameStarted: boolean;
  currentRound: number;
  totalRounds: number;
  settings: any;
  gamePhase: "waiting" | "countdown" | "playing" | "scoring" | "finished";
}

class GameServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Room> = new Map();
  private players: Map<string, Player> = new Map();
  private port: number;
  private app: express.Express;

  constructor(port: number = 3001) {
    this.port = port;

    // Create Express app for HTTP endpoints
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());

    // Health check endpoint
    this.app.get("/", (req, res) => {
      res.json({
        status: "online",
        message: "🎮 Guess The Jam Game Server is running!",
        players: this.players.size,
        rooms: this.rooms.size,
        uptime: process.uptime(),
      });
    });

    // Server info endpoint
    this.app.get("/status", (req, res) => {
      res.json({
        server: "Guess The Jam",
        version: "1.0.0",
        players: this.players.size,
        rooms: this.rooms.size,
        timestamp: new Date().toISOString(),
      });
    });

    // Create HTTP server
    const server = createServer(this.app);

    // Create WebSocket server
    this.wss = new WebSocketServer({ server });

    this.setupWebSocket();

    // Start server
    server.listen(this.port, "0.0.0.0", () => {
      console.log(`🎮 Game server running on port ${this.port}`);
      console.log(`🌐 Health check: http://localhost:${this.port}/`);
      console.log(`📊 Status: http://localhost:${this.port}/status`);
      console.log(`🔌 WebSocket: ws://localhost:${this.port}`);
    });
  }

  private setupWebSocket() {
    this.wss.on("connection", (ws: WebSocket, req) => {
      const url = parse(req.url || "", true);
      const roomId = url.query.roomId as string;
      const playerName = url.query.name as string;
      const playerId = this.generatePlayerId();

      console.log(
        `🔌 Player ${playerName} (${playerId}) connecting to room ${roomId}`,
      );

      const player: Player = {
        id: playerId,
        name: playerName,
        ws,
        roomId,
        ready: false,
        score: 0,
      };

      this.players.set(playerId, player);
      this.joinRoom(roomId, player);

      this.sendToPlayer(playerId, {
        type: "room_joined",
        roomId,
        playerId,
        room: this.getRoomState(roomId),
      });

      this.broadcastToRoom(
        roomId,
        {
          type: "player_joined",
          player: {
            id: playerId,
            name: playerName,
            ready: false,
            score: 0,
          },
        },
        [playerId],
      );

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(playerId, message);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });

      ws.on("close", () => {
        console.log(`🔌 Player ${playerName} (${playerId}) disconnected`);
        this.handlePlayerDisconnect(playerId);
      });
    });
  }

  private generatePlayerId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private joinRoom(roomId: string, player: Player) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        hostId: player.id,
        players: new Map(),
        gameStarted: false,
        currentRound: 1,
        totalRounds: 5,
        settings: {},
        gamePhase: "waiting",
      });
    }

    const room = this.rooms.get(roomId)!;
    room.players.set(player.id, player);
  }

  private getRoomState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      hostId: room.hostId,
      players: Array.from(room.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        ready: p.ready,
        score: p.score,
      })),
      gameStarted: room.gameStarted,
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      gamePhase: room.gamePhase,
    };
  }

  private sendToPlayer(playerId: string, message: any) {
    const player = this.players.get(playerId);
    if (player && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  }

  private broadcastToRoom(
    roomId: string,
    message: any,
    excludePlayerIds: string[] = [],
  ) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.forEach((player, playerId) => {
      if (!excludePlayerIds.includes(playerId)) {
        this.sendToPlayer(playerId, message);
      }
    });
  }

  private handleMessage(playerId: string, message: any) {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (message.type) {
      case "player_ready":
        player.ready = message.ready;
        this.broadcastToRoom(player.roomId, {
          type: "player_ready_update",
          playerId,
          ready: message.ready,
        });
        break;

      case "start_game":
        const room = this.rooms.get(player.roomId);
        if (room && room.hostId === playerId) {
          room.gameStarted = true;
          room.gamePhase = "countdown";
          this.broadcastToRoom(player.roomId, {
            type: "game_starting",
            countdown: 5,
          });
        }
        break;

      default:
        console.log(`📨 Unknown message type: ${message.type}`);
    }
  }

  private handlePlayerDisconnect(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (room) {
      room.players.delete(playerId);

      if (room.players.size === 0) {
        this.rooms.delete(player.roomId);
      } else if (room.hostId === playerId) {
        // Assign new host
        const newHost = room.players.values().next().value;
        room.hostId = newHost.id;
        this.broadcastToRoom(player.roomId, {
          type: "new_host",
          hostId: newHost.id,
        });
      }
    }

    this.players.delete(playerId);
  }
}

// Start the server
const server = new GameServer(
  process.env.PORT ? parseInt(process.env.PORT) : 3001,
);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});
