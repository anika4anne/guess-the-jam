import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  playerId?: string;
  roomId?: string;
  room?: {
    id: string;
    hostId: string;
    players: Array<{
      id: string;
      name: string;
      ready: boolean;
      score: number;
    }>;
    gameStarted: boolean;
    currentRound: number;
    totalRounds: number;
    gamePhase: string;
  };
  player?: {
    id: string;
    name: string;
    ready: boolean;
    score: number;
  };
  playerName?: string;
  ready?: boolean;
  countdown?: number;
  round?: number;
  totalRounds?: number;
  hostId?: string;
  hostName?: string;
  event?: string;
  data?: unknown;
  [key: string]: unknown;
}

interface WebSocketHook {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  connect: (roomId: string, playerName: string) => void;
  disconnect: () => void;
}

export const useWebSocket = (): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback((roomId: string, playerName: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const wsUrl = `ws://localhost:3001?roomId=${encodeURIComponent(roomId)}&name=${encodeURIComponent(playerName)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("🔌 WebSocket connected");
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log("📨 WebSocket message received:", message);
        setLastMessage(message);

        switch (message.type) {
          case "room_joined":
            console.log("✅ Joined room:", message.roomId);
            break;

          case "player_joined":
            if (message.player) {
              console.log("👥 Player joined:", message.player.name);
            }
            break;

          case "player_left":
            console.log("👋 Player left:", message.playerName);
            break;

          case "player_ready_update":
            console.log(
              "🎯 Player ready update:",
              message.playerId,
              message.ready,
            );
            break;

          case "all_players_ready":
            console.log("🚀 All players ready!");
            break;

          case "game_starting":
            console.log("🎮 Game starting in:", message.countdown, "seconds");
            break;

          case "countdown_update":
            console.log("⏰ Countdown:", message.countdown);
            break;

          case "gameplay_started":
            console.log("🎵 Gameplay started! Round:", message.round);
            break;

          case "new_host":
            console.log("👑 New host:", message.hostName);
            break;

          case "player_kicked":
            console.log("👢 Player kicked:", message.playerName);
            break;

          case "player_banned":
            console.log("🚫 Player banned:", message.playerId);
            break;

          case "webhook_event":
            console.log("🔗 Webhook event:", message.event, message.data);
            break;

          default:
            console.log("❓ Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket disconnected:", event.code, event.reason);
      setIsConnected(false);

      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...");
          connect(roomId, playerName);
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  }, []);

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
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("📤 Sending message:", message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }, []);

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
  };
};
