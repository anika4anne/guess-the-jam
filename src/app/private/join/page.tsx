// src/app/private/join/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoinPrivateRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");

  // Set room code from URL if provided
  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (roomId) {
      setRoomCode(roomId);
    }
  }, [searchParams]);

  const handleJoin = () => {
    if (!roomCode || !name) return;
    router.push(`/private/${roomCode}?name=${encodeURIComponent(name)}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] px-6 text-white">
      <h1 className="mb-6 text-4xl font-bold text-pink-300">🎉 Join a Room</h1>
      <div className="space-y-4 rounded-2xl bg-white/10 p-8 text-center shadow-lg backdrop-blur-md">
        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg px-4 py-2 text-white focus:outline-none"
        />
        <input
          placeholder="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="w-full rounded-lg px-4 py-2 text-white focus:outline-none"
        />
        <button
          onClick={handleJoin}
          className="w-full rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-600"
        >
          Join Room
        </button>
      </div>
    </main>
  );
}
