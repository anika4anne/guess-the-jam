import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { parse } from "url";
import { config } from "./config.js";
class ProductionGameServer {
    constructor(port = config.websocket.port) {
        this.rooms = new Map();
        this.players = new Map();
        this.port = port;
        this.server = createServer();
        this.wss = new WebSocketServer({ server: this.server });
        console.log(`✅ WebSocket server initialized on port ${this.port}`);
        this.setupHealthCheck();
        this.setupWebSocket();
        this.startServer();
    }
    setupHealthCheck() {
        this.server.on("request", (req, res) => {
            if (req.url === "/" || req.url === "/health") {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": config.server.cors.origin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                });
                const healthData = {
                    status: "healthy",
                    timestamp: new Date().toISOString(),
                    server: "Guess The Jam Game Server",
                    version: "1.0.0",
                    rooms: this.rooms.size,
                    totalPlayers: this.players.size,
                    uptime: process.uptime(),
                };
                res.end(JSON.stringify(healthData, null, 2));
                return;
            }
            if (req.method === "OPTIONS") {
                res.writeHead(200, {
                    "Access-Control-Allow-Origin": config.server.cors.origin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                });
                res.end();
                return;
            }
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Not Found" }));
        });
    }
    setupWebSocket() {
        this.wss.on("connection", (ws, req) => {
            const url = parse(req.url || "", true);
            const roomId = url.query.roomId;
            const playerName = url.query.name;
            const playerId = this.generatePlayerId();
            if (!roomId || !playerName) {
                console.error("❌ Invalid connection attempt - missing roomId or name");
                ws.close(1008, "Missing roomId or name");
                return;
            }
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
    startServer() {
        this.server.listen(this.port, config.websocket.host, () => {
            console.log(`🎮 Production Game Server running on ${config.websocket.host}:${this.port}`);
            console.log(`🌐 Health check available at http://${config.websocket.host}:${this.port}/health`);
            console.log(`🔌 WebSocket endpoint: ws://${config.websocket.host}:${this.port}`);
        });
        this.server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`❌ Port ${this.port} is already in use`);
                process.exit(1);
            }
            else {
                console.error("❌ Server error:", error);
            }
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
            case "game_state_sync":
                this.handleGameStateSync(player.roomId, message.gameState);
                break;
            case "submit_answer":
                this.handleAnswerSubmission(player.roomId, playerId, message.answer);
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
        if (room.settings.mode === "chat") {
            this.startChatRound(roomId);
        }
        else {
            this.broadcastToRoom(roomId, {
                type: "gameplay_started",
                round: room.currentRound,
                totalRounds: room.totalRounds,
            });
        }
    }
    startChatRound(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.roundStartTime = Date.now();
        room.roundDuration = 30000;
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
            { title: "Creep", artist: "Radiohead" },
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
    endChatRound(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.gamePhase = "scoring";
        this.broadcastToRoom(roomId, {
            type: "chat_round_ended",
            round: room.currentRound,
            totalRounds: room.totalRounds,
            song: room.currentSong,
            artist: room.currentArtist,
            scores: Array.from(room.players.values()).map((p) => ({
                id: p.id,
                name: p.name,
                score: p.score,
            })),
        });
        setTimeout(() => {
            if (room.currentRound < room.totalRounds) {
                room.currentRound++;
                this.startChatRound(roomId);
            }
            else {
                this.endGame(roomId);
            }
        }, 5000);
    }
    endGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.gamePhase = "finished";
        const finalScores = Array.from(room.players.values())
            .map((p) => ({ id: p.id, name: p.name, score: p.score }))
            .sort((a, b) => b.score - a.score);
        this.broadcastToRoom(roomId, {
            type: "game_ended",
            finalScores,
            winner: finalScores[0],
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
    handleAnswerSubmission(roomId, playerId, answer) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const player = this.players.get(playerId);
        if (!player)
            return;
        // Store the answer in the room
        if (!room.answers) {
            room.answers = new Map();
        }
        const roundKey = `round-${room.currentRound}`;
        if (!room.answers.has(roundKey)) {
            room.answers.set(roundKey, new Map());
        }
        const roundAnswers = room.answers.get(roundKey);
        if (roundAnswers) {
            roundAnswers.set(playerId, answer);
        }
        // Broadcast to all players in the room
        this.broadcastToRoom(roomId, {
            type: "answer_submitted",
            playerId,
            answer,
            answers: this.getRoundAnswers(roomId, room.currentRound),
            allAnswers: this.getAllAnswers(roomId),
        });
        console.log(`📝 Player ${player.name} submitted answer for round ${room.currentRound}`);
    }
    handleGameStateSync(roomId, gameState) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        // Store the game state
        room.gameState = gameState;
        // Broadcast the updated game state to all players
        this.broadcastToRoom(roomId, {
            type: "game_state_updated",
            gameState: room.gameState,
        });
        console.log(`🔄 Game state synchronized for room ${roomId}`);
    }
    getRoundAnswers(roomId, round) {
        const room = this.rooms.get(roomId);
        if (!room || !room.answers)
            return {};
        const roundKey = `round-${round}`;
        const roundAnswers = room.answers.get(roundKey);
        if (!roundAnswers)
            return {};
        const result = {};
        roundAnswers.forEach((answer, playerId) => {
            const player = this.players.get(playerId);
            if (player) {
                result[player.name] = answer;
            }
        });
        return result;
    }
    getAllAnswers(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.answers)
            return {};
        const result = {};
        room.answers.forEach((roundAnswers, roundKey) => {
            result[roundKey] = {};
            roundAnswers.forEach((answer, playerId) => {
                const player = this.players.get(playerId);
                if (player) {
                    result[roundKey][player.name] = answer;
                }
            });
        });
        return result;
    }
    handleChatGuess(playerId, guess) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        const room = this.rooms.get(player.roomId);
        if (!room)
            return;
        if (room.settings.mode !== "chat" || !room.currentSong)
            return;
        const normalizedGuess = guess.toLowerCase().trim();
        const normalizedSong = room.currentSong.toLowerCase().trim();
        if (normalizedGuess === normalizedSong &&
            !room.guessedPlayers?.has(playerId)) {
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
        }
        else {
            this.broadcastToRoom(player.roomId, {
                type: "chat_guess_incorrect",
                playerId,
                playerName: player.name,
                guess,
            });
        }
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
            settings: room.settings,
            gameState: room.gameState,
            answers: room.answers ? this.getAllAnswers(roomId) : {},
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
    getStats() {
        return {
            rooms: this.rooms.size,
            totalPlayers: this.players.size,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString(),
        };
    }
}
const gameServer = new ProductionGameServer();
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down server gracefully...");
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down server gracefully...");
    process.exit(0);
});
export default gameServer;
