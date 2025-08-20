"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatGameMode } from "~/components/ChatGameMode";
import { useWebSocket } from "~/hooks/useWebSocket";

export function ChatGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const playerName = searchParams.get("name");

  const { sendMessage, lastMessage, connect, disconnect } = useWebSocket();

  useEffect(() => {
    if (!roomId || !playerName) {
      router.push("/private");
      return;
    }

    // Connect to WebSocket for the chat game
    connect(roomId, playerName);

    return () => {
      disconnect();
    };
  }, [roomId, playerName, connect, disconnect, router]);

  if (!roomId || !playerName) {
    return null;
  }

  return (
    <ChatGameMode
      roomId={roomId}
      playerName={playerName}
      onSendMessage={sendMessage}
      lastMessage={lastMessage}
    />
  );
}
