import { useEffect, useRef, useState, useCallback } from "react";

interface GamePlayer {
  id: string;
  name: string;
  ready: boolean;
  score: number;
}

interface GameRoom {
  id: string;
  hostId: string;
  players: GamePlayer[];
  gameStarted: boolean;
  currentRound: number;
  totalRounds: number;
  gamePhase: "waiting" | "countdown" | "playing" | "scoring" | "finished";
  settings?: {
    mode?: string;
    rounds?: number;
    playlists?: string[];
    selectedYears?: number[];
    [key: string]: unknown;
  };
}

interface GameAnswer {
  song: string;
  artist: string;
  points: number;
  songCorrect: boolean;
  artistCorrect: boolean;
  songRaw?: string;
  artistRaw?: string;
}

interface GameWebSocketMessage {
  type: string;
  playerId?: string;
  roomId?: string;
  room?: GameRoom;
  player?: GamePlayer;
  playerName?: string;
  ready?: boolean;
  countdown?: number;
  round?: number;
  totalRounds?: number;
  hostId?: string;
  hostName?: string;
  song?: string;
  artist?: string;
  guess?: string;
  score?: number;
  winner?: {
    id: string;
    name: string;
    score: number;
  };
  settings?: any;
  answers?: Record<string, GameAnswer>;
  allAnswers?: Record<string, GameAnswer>;
  currentPlayerIndex?: number;
  playerScores?: Record<string, number>;
  roundStartTime?: number;
  roundDuration?: number;
  [key: string]: unknown;
}

interface GameWebSocketHook {
  isConnected: boolean;
  sendMessage: (message: GameWebSocketMessage) => void;
  lastMessage: GameWebSocketMessage | null;
  connect: (roomId: string, playerName: string) => void;
  disconnect: () => void;
  
  // Game-specific state
  room: GameRoom | null;
  currentPlayerId: string | null;
  isHost: boolean;
  
  // Game state synchronization
  syncGameState: (gameState: any) => void;
  submitAnswer: (answer: GameAnswer) => void;
  getPlayerAnswers: () => Record<string, GameAnswer>;
  waitForAllAnswers: () => Promise<Record<string, GameAnswer>>;
}

export const useGameWebSocket = (): GameWebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<GameWebSocketMessage | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Game state synchronization
  const pendingAnswers = useRef<Record<string, GameAnswer>>({});
  const answerResolvers = useRef<Map<string, (answers: Record<string, GameAnswer>) => void>>(new Map());

  const connect = useCallback((roomId: string, playerName: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const wsUrl = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "ws://localhost:3001"}?roomId=${encodeURIComponent(roomId)}&name=${encodeURIComponent(playerName)}`;
    console.log("🎮 Connecting to game server:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("🎮 Connected to game server successfully");
      setIsConnected(true);
      reconnectAttempts.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: GameWebSocketMessage = JSON.parse(event.data);
        console.log("🎮 Game message received:", message);
        setLastMessage(message);

        // Handle game-specific messages
        handleGameMessage(message);
      } catch (error) {
        console.error("Error parsing game message:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("🎮 Game server disconnected:", event.code, event.reason);
      setIsConnected(false);

      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect to game server...");
          connect(roomId, playerName);
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("Game WebSocket error:", error);
    };

    wsRef.current = ws;
  }, []);

  const handleGameMessage = useCallback((message: GameWebSocketMessage) => {
    switch (message.type) {
      case "room_joined":
        if (message.playerId) {
          setCurrentPlayerId(message.playerId);
        }
        if (message.room) {
          setRoom(message.room);
          if (message.playerId) {
            setIsHost(message.room.hostId === message.playerId);
          }
        }
        break;

      case "player_joined":
        if (message.player && message.room) {
          setRoom(message.room);
        }
        break;

      case "player_left":
        if (message.room) {
          setRoom(message.room);
        }
        break;

      case "player_ready_update":
        if (message.room) {
          setRoom(message.room);
        }
        break;

      case "game_settings_updated":
        if (message.settings && room) {
          setRoom(prev => prev ? { ...prev, settings: { ...prev.settings, ...message.settings } } : null);
        }
        break;

      case "game_starting":
        if (message.room) {
          setRoom(message.room);
        }
        break;

      case "gameplay_started":
        if (message.room) {
          setRoom(message.room);
        }
        break;

      case "answer_submitted":
        if (message.answers) {
          pendingAnswers.current = message.answers;
          
          // Check if we have all answers for the current round
          const roundKey = `round-${room?.currentRound}`;
          if (answerResolvers.current.has(roundKey)) {
            const resolver = answerResolvers.current.get(roundKey);
            if (resolver) {
              resolver(message.answers);
              answerResolvers.current.delete(roundKey);
            }
          }
        }
        break;

      case "chat_round_started":
        if (message.room) {
          setRoom(message.room);
        }
        break;

      case "chat_round_ended":
        if (message.room) {
          setRoom(message.room);
        }
        break;

      case "game_ended":
        if (message.room) {
          setRoom(message.room);
        }
        break;

      case "new_host":
        if (message.hostId) {
          setIsHost(message.hostId === currentPlayerId);
          if (message.room) {
            setRoom(message.room);
          }
        }
        break;
    }
  }, [room, currentPlayerId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    setIsConnected(false);
    setRoom(null);
    setCurrentPlayerId(null);
    setIsHost(false);
  }, []);

  const sendMessage = useCallback((message: GameWebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("🎮 Sending game message:", message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("Game WebSocket not connected, cannot send message");
    }
  }, []);

  // Game-specific methods
  const syncGameState = useCallback((gameState: any) => {
    sendMessage({
      type: "game_state_sync",
      roomId: room?.id,
      gameState
    });
  }, [sendMessage, room?.id]);

  const submitAnswer = useCallback((answer: GameAnswer) => {
    if (!room?.id || !currentPlayerId) return;
    
    sendMessage({
      type: "submit_answer",
      roomId: room.id,
      playerId: currentPlayerId,
      answer
    });
  }, [sendMessage, room?.id, currentPlayerId]);

  const getPlayerAnswers = useCallback(() => {
    return pendingAnswers.current;
  }, []);

  const waitForAllAnswers = useCallback(async (): Promise<Record<string, GameAnswer>> => {
    if (!room?.id) return {};
    
    const roundKey = `round-${room.currentRound}`;
    
    return new Promise((resolve) => {
      answerResolvers.current.set(roundKey, resolve);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (answerResolvers.current.has(roundKey)) {
          answerResolvers.current.delete(roundKey);
          resolve(pendingAnswers.current);
        }
      }, 30000);
    });
  }, [room?.id, room?.currentRound]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connect,
    disconnect,
    room,
    currentPlayerId,
    isHost,
    syncGameState,
    submitAnswer,
    getPlayerAnswers,
    waitForAllAnswers
  };
};
