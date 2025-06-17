"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PrivateRoom({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = params;
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Guest";

  const storageKey = `room-${roomId}-players`;
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    // Load existing players
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Prevent duplicate name
    if (!existing.includes(name)) {
      const updated = [...existing, name];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setPlayers(updated);
    } else {
      setPlayers(existing);
    }

    // Clean up on unmount (optional)
    return () => {
      // You can also implement a timeout-based remove here
    };
  }, [name]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 text-white">
      <h1 className="mb-6 text-4xl font-extrabold drop-shadow-md">
        🎧 Room <span className="text-green-500">{roomId}</span>
      </h1>

      <p className="mb-4 text-white/80">Share the code to invite friends!</p>

      <div className="mb-8 space-y-2 rounded-xl bg-white/10 p-6 shadow-md">
        <h2 className="text-xl font-semibold text-white">Players in Lobby</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {players.map((player, index) => (
            <div
              key={index}
              className="rounded-xl bg-white/10 px-4 py-2 text-center text-white/80"
            >
              {player}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
