import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { parse } from "url";
import { config } from "./config.js";

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
  currentSong?: string;
  currentArtist?: string;
  roundStartTime?: number;
  roundDuration?: number;
  guessedPlayers?: Set<string>;
}

class GameServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Room> = new Map();
  private players: Map<string, Player> = new Map();
  private port: number;

  constructor(port: number = config.websocket.port) {
    this.port = port;
    const server = createServer();

    // Add health check endpoint
    server.on("request", (req, res) => {
      if (req.url === "/" || req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("🎮 Guess The Jam WebSocket Server is running!");
        return;
      }

      // Handle WebSocket upgrade requests
      if (req.headers.upgrade === "websocket") {
        // Let the WebSocket server handle this
        return;
      }

      // Default response for other requests
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    this.wss = new WebSocketServer({ server });

    this.setupWebSocket();
    server.listen(
      this.port,
      config.websocket.host === "0.0.0.0" ? "0.0.0.0" : undefined,
      () => {
        console.log(
          `🎮 Game server running on ${config.websocket.host}:${this.port}`,
        );
      },
    );
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

      ws.on("error", (error) => {
        console.error(`WebSocket error for player ${playerId}:`, error);
        this.handlePlayerDisconnect(playerId);
      });
    });
  }

  private joinRoom(roomId: string, player: Player) {
    let room = this.rooms.get(roomId);

    if (!room) {
      room = {
        id: roomId,
        hostId: player.id,
        players: new Map(),
        gameStarted: false,
        currentRound: 1,
        totalRounds: 10,
        settings: {},
        gamePhase: "waiting",
      };
      this.rooms.set(roomId, room);
      console.log(`🏠 Created new room: ${roomId}`);
    }

    room.players.set(player.id, player);
    console.log(
      `👥 Player ${player.name} joined room ${roomId}. Total players: ${room.players.size}`,
    );
  }

  private handleMessage(playerId: string, message: any) {
    const player = this.players.get(playerId);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (!room) return;

    switch (message.type) {
      case "player_ready":
        this.handlePlayerReady(playerId, message.ready);
        break;

      case "start_game":
        if (room.hostId === playerId) {
          this.startGame(player.roomId);
        }
        break;

      case "game_settings_update":
        if (room.hostId === playerId) {
          this.handleGameSettingsUpdate(player.roomId, message.settings);
        }
        break;

      case "submit_answer":
        this.handleAnswer(playerId, message.answer);
        break;

      case "chat_guess":
        this.handleChatGuess(playerId, message.guess);
        break;

      case "kick_player":
        if (room.hostId === playerId) {
          this.kickPlayer(player.roomId, message.targetPlayerId);
        }
        break;

      case "ban_player":
        if (room.hostId === playerId) {
          this.banPlayer(player.roomId, message.targetPlayerId);
        }
        break;

      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private handlePlayerReady(playerId: string, ready: boolean) {
    const player = this.players.get(playerId);
    if (!player) return;

    player.ready = ready;

    this.broadcastToRoom(player.roomId, {
      type: "player_ready_update",
      playerId,
      ready,
    });

    this.checkAllPlayersReady(player.roomId);
  }

  private checkAllPlayersReady(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const allReady = Array.from(room.players.values()).every((p) => p.ready);

    if (allReady) {
      this.broadcastToRoom(roomId, {
        type: "all_players_ready",
        canStart: true,
      });
    }
  }

  private startGame(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameStarted = true;
    room.gamePhase = "countdown";

    console.log(`🎮 Starting game in room ${roomId}`);

    this.broadcastToRoom(roomId, {
      type: "game_starting",
      countdown: 5,
    });

    let countdown = 5;
    const countdownInterval = setInterval(() => {
      countdown--;

      if (countdown > 0) {
        this.broadcastToRoom(roomId, {
          type: "countdown_update",
          countdown,
        });
      } else {
        clearInterval(countdownInterval);
        this.startGameplay(roomId);
      }
    }, 1000);
  }

  private startGameplay(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gamePhase = "playing";

    if (room.settings.mode === "chat") {
      this.startChatRound(roomId);
    } else {
      this.broadcastToRoom(roomId, {
        type: "gameplay_started",
        round: room.currentRound,
        totalRounds: room.totalRounds,
      });
    }
  }

  private startChatRound(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.roundStartTime = Date.now();
    room.roundDuration = 30000; // 30 seconds
    room.guessedPlayers = new Set();

    const sampleSongs = [
      { title: "Bohemian Rhapsody", artist: "Queen" },
      { title: "Hotel California", artist: "Eagles" },
      { title: "Imagine", artist: "John Lennon" },
      { title: "Stairway to Heaven", artist: "Led Zeppelin" },
      { title: "Like a Rolling Stone", artist: "Bob Dylan" },
      { title: "Smells Like Teen Spirit", artist: "Nirvana" },
      { title: "Hey Jude", artist: "The Beatles" },
      { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
      { title: "Wonderwall", artist: "Oasis" },
      { title: "Creep", artist: "Radiohead" }
    ];

    const randomIndex = Math.floor(Math.random() * sampleSongs.length);
    const randomSong = sampleSongs[randomIndex];
    if (randomSong) {
      room.currentSong = randomSong.title;
      room.currentArtist = randomSong.artist;
    }

    this.broadcastToRoom(roomId, {
      type: "chat_round_started",
      round: room.currentRound,
      totalRounds: room.totalRounds,
      song: room.currentSong,
      artist: room.currentArtist,
      roundDuration: room.roundDuration,
    });

    setTimeout(() => {
      this.endChatRound(roomId);
    }, room.roundDuration);
  }

  private endChatRound(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gamePhase = "scoring";

    this.broadcastToRoom(roomId, {
      type: "chat_round_ended",
      round: room.currentRound,
      totalRounds: room.totalRounds,
      song: room.currentSong,
      artist: room.currentArtist,
      scores: Array.from(room.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score
      }))
    });

    setTimeout(() => {
      if (room.currentRound < room.totalRounds) {
        room.currentRound++;
        this.startChatRound(roomId);
      } else {
        this.endGame(roomId);
      }
    }, 5000);
  }

  private endGame(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gamePhase = "finished";

    const finalScores = Array.from(room.players.values())
      .map(p => ({ id: p.id, name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);

    this.broadcastToRoom(roomId, {
      type: "game_ended",
      finalScores,
      winner: finalScores[0]
    });
  }

  private handleAnswer(playerId: string, answer: any) {
    const player = this.players.get(playerId);
    if (!player) return;

    this.broadcastToRoom(player.roomId, {
      type: "answer_submitted",
      playerId,
      answer,
    });
  }

  private handleChatGuess(playerId: string, guess: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (!room) return;

    if (room.settings.mode !== "chat" || !room.currentSong) return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedSong = room.currentSong.toLowerCase().trim();

    if (normalizedGuess === normalizedSong && !room.guessedPlayers?.has(playerId)) {
      if (!room.guessedPlayers) {
        room.guessedPlayers = new Set();
      }
      room.guessedPlayers.add(playerId);

      player.score += 10;
      room.players.set(playerId, player);

      this.broadcastToRoom(player.roomId, {
        type: "chat_guess_correct",
        playerId,
        playerName: player.name,
        guess,
        score: player.score,
      });

      console.log(`🎯 ${player.name} correctly guessed: ${guess}`);
    } else {
      this.broadcastToRoom(player.roomId, {
        type: "chat_guess_incorrect",
        playerId,
        playerName: player.name,
        guess,
      });
    }
  }

  private handleGameSettingsUpdate(roomId: string, settings: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.settings = { ...room.settings, ...settings };

    this.broadcastToRoom(roomId, {
      type: "game_settings_updated",
      settings: room.settings,
    });

    console.log(`⚙️ Game settings updated for room ${roomId}:`, settings);
  }

  private kickPlayer(roomId: string, targetPlayerId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const targetPlayer = room.players.get(targetPlayerId);
    if (!targetPlayer) return;

    room.players.delete(targetPlayerId);
    this.players.delete(targetPlayerId);

    targetPlayer.ws.close();

    this.broadcastToRoom(roomId, {
      type: "player_kicked",
      playerId: targetPlayerId,
      playerName: targetPlayer.name,
    });
  }

  private banPlayer(roomId: string, targetPlayerId: string) {
    this.kickPlayer(roomId, targetPlayerId);

    this.broadcastToRoom(roomId, {
      type: "player_banned",
      playerId: targetPlayerId,
    });
  }

  private handlePlayerDisconnect(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (!room) return;

    room.players.delete(playerId);
    this.players.delete(playerId);

    if (room.hostId === playerId) {
      if (room.players.size > 0) {
        const newHost = Array.from(room.players.values())[0];
        if (newHost) {
          room.hostId = newHost.id;

          this.broadcastToRoom(player.roomId, {
            type: "new_host",
            hostId: newHost.id,
            hostName: newHost.name,
          });
        }
      } else {
        this.rooms.delete(player.roomId);
        console.log(`🏠 Room ${player.roomId} closed (no players left)`);
        return;
      }
    }

    this.broadcastToRoom(player.roomId, {
      type: "player_left",
      playerId,
      playerName: player.name,
    });
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
      settings: room.settings,
    };
  }

  private sendToPlayer(playerId: string, message: any) {
    const player = this.players.get(playerId);
    if (!player || player.ws.readyState !== WebSocket.OPEN) return;

    try {
      player.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending message to player ${playerId}:`, error);
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

  private generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  public triggerWebhook(roomId: string, event: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.broadcastToRoom(roomId, {
      type: "webhook_event",
      event,
      data,
    });
  }

  public getRoomInfo(roomId: string) {
    return this.getRoomState(roomId);
  }

  public getAllRooms() {
    return Array.from(this.rooms.values()).map((room) => ({
      id: room.id,
      playerCount: room.players.size,
      gameStarted: room.gameStarted,
    }));
  }
}

const gameServer = new GameServer();

export default gameServer;
