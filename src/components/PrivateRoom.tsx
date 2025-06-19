"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

interface PrivateRoomProps {
  roomId: string;
}

export function PrivateRoom({ roomId }: PrivateRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const [players, setPlayers] = useState<string[]>([]);

  // Redirect if no name is provided
  useEffect(() => {
    if (!name) {
      router.push(`/private/join?roomId=${roomId}`);
    }
  }, [name, roomId, router]);

  // Handle player list
  useEffect(() => {
    if (!name) return;

    const storageKey = `room-${roomId}-players`;

    // Load existing players
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Add current player if not already in list
    if (!existing.includes(name)) {
      const updated = [...existing, name];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setPlayers(updated);
    } else {
      setPlayers(existing);
    }

    // Set up interval to check for updates
    const interval = setInterval(() => {
      const current = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setPlayers(current);
    }, 1000);

    // Clean up on unmount
    return () => {
      clearInterval(interval);
      // Remove player from list when they leave
      const current = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const updated = current.filter((p: string) => p !== name);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    };
  }, [name, roomId]);

  const handleBack = () => {
    router.push("/private");
  };

  // If no name, don't render anything while redirecting
  if (!name) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 text-white">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          ← Back
        </Button>
      </div>

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
              {player} {player === name ? "(You)" : ""}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
