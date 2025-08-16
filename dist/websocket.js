import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { parse } from "url";
import { config } from "./config.js";
class GameServer {
    constructor(port = config.websocket.port) {
        this.rooms = new Map();
        this.players = new Map();
        this.port = port;
        const server = createServer();
        // Add health check endpoint for Railway
        server.on('request', (req, res) => {
            if (req.url === '/' || req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('🎮 Guess The Jam WebSocket Server is running!');
                return;
            }
            // Handle WebSocket upgrade requests
            if (req.headers.upgrade === 'websocket') {
                // Let the WebSocket server handle this
                return;
            }
            // Default response for other requests
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        });
        this.wss = new WebSocketServer({ server });
        this.setupWebSocket();
        server.listen(this.port, config.websocket.host === "0.0.0.0" ? "0.0.0.0" : undefined, () => {
            console.log(`🎮 Game server running on ${config.websocket.host}:${this.port}`);
        });
    }
    setupWebSocket() {
        this.wss.on("connection", (ws, req) => {
            const url = parse(req.url || "", true);
            const roomId = url.query.roomId;
            const playerName = url.query.name;
            const playerId = this.generatePlayerId();
            console.log(`🔌 Player ${playerName} (${playerId}) connecting to room ${roomId}`);
            const player = {
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
            this.broadcastToRoom(roomId, {
                type: "player_joined",
                player: {
                    id: playerId,
                    name: playerName,
                    ready: false,
                    score: 0,
                },
            }, [playerId]);
            ws.on("message", (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(playerId, message);
                }
                catch (error) {
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
    joinRoom(roomId, player) {
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
        console.log(`👥 Player ${player.name} joined room ${roomId}. Total players: ${room.players.size}`);
    }
    handleMessage(playerId, message) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        const room = this.rooms.get(player.roomId);
        if (!room)
            return;
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
    handlePlayerReady(playerId, ready) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        player.ready = ready;
        this.broadcastToRoom(player.roomId, {
            type: "player_ready_update",
            playerId,
            ready,
        });
        this.checkAllPlayersReady(player.roomId);
    }
    checkAllPlayersReady(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const allReady = Array.from(room.players.values()).every((p) => p.ready);
        if (allReady) {
            this.broadcastToRoom(roomId, {
                type: "all_players_ready",
                canStart: true,
            });
        }
    }
    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
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
            }
            else {
                clearInterval(countdownInterval);
                this.startGameplay(roomId);
            }
        }, 1000);
    }
    startGameplay(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.gamePhase = "playing";
        this.broadcastToRoom(roomId, {
            type: "gameplay_started",
            round: room.currentRound,
            totalRounds: room.totalRounds,
        });
    }
    handleAnswer(playerId, answer) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        this.broadcastToRoom(player.roomId, {
            type: "answer_submitted",
            playerId,
            answer,
        });
    }
    handleGameSettingsUpdate(roomId, settings) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.settings = { ...room.settings, ...settings };
        this.broadcastToRoom(roomId, {
            type: "game_settings_updated",
            settings: room.settings,
        });
        console.log(`⚙️ Game settings updated for room ${roomId}:`, settings);
    }
    kickPlayer(roomId, targetPlayerId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const targetPlayer = room.players.get(targetPlayerId);
        if (!targetPlayer)
            return;
        room.players.delete(targetPlayerId);
        this.players.delete(targetPlayerId);
        targetPlayer.ws.close();
        this.broadcastToRoom(roomId, {
            type: "player_kicked",
            playerId: targetPlayerId,
            playerName: targetPlayer.name,
        });
    }
    banPlayer(roomId, targetPlayerId) {
        this.kickPlayer(roomId, targetPlayerId);
        this.broadcastToRoom(roomId, {
            type: "player_banned",
            playerId: targetPlayerId,
        });
    }
    handlePlayerDisconnect(playerId) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        const room = this.rooms.get(player.roomId);
        if (!room)
            return;
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
            }
            else {
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
    getRoomState(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
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
    sendToPlayer(playerId, message) {
        const player = this.players.get(playerId);
        if (!player || player.ws.readyState !== WebSocket.OPEN)
            return;
        try {
            player.ws.send(JSON.stringify(message));
        }
        catch (error) {
            console.error(`Error sending message to player ${playerId}:`, error);
        }
    }
    broadcastToRoom(roomId, message, excludePlayerIds = []) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.players.forEach((player, playerId) => {
            if (!excludePlayerIds.includes(playerId)) {
                this.sendToPlayer(playerId, message);
            }
        });
    }
    generatePlayerId() {
        return Math.random().toString(36).substring(2, 10);
    }
    triggerWebhook(roomId, event, data) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        this.broadcastToRoom(roomId, {
            type: "webhook_event",
            event,
            data,
        });
    }
    getRoomInfo(roomId) {
        return this.getRoomState(roomId);
    }
    getAllRooms() {
        return Array.from(this.rooms.values()).map((room) => ({
            id: room.id,
            playerCount: room.players.size,
            gameStarted: room.gameStarted,
        }));
    }
}
const gameServer = new GameServer();
export default gameServer;
