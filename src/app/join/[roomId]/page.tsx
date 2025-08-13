"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Confetti from "react-confetti";
import { Button } from "~/components/ui/button";

export default function JoinRoomGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const roomId = params.roomId as string;
  const name = searchParams.get("name") ?? "";

  const [numberOfRounds, setNumberOfRounds] = useState(10);
  const [mode, setMode] = useState<"default" | "playlist">("default");
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [gameFinished] = useState(false);

  useEffect(() => {
    const roundsKey = `room-${roomId}-rounds`;
    const modeKey = `room-${roomId}-mode`;
    const playlistsKey = `room-${roomId}-playlists`;
    const storedRounds = localStorage.getItem(roundsKey);
    if (storedRounds) setNumberOfRounds(Number(storedRounds));
    const storedMode = localStorage.getItem(modeKey);
    if (storedMode === "playlist" || storedMode === "default")
      setMode(storedMode);
    const storedPlaylists = localStorage.getItem(playlistsKey);
    if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));
  }, [roomId]);

  if (!name) {
    return (
      <div className="mt-20 text-center text-white">
        Missing player name. Please rejoin from the lobby.
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 text-white">
      {!gameFinished && (
        <>
          <h1 className="mb-6 text-3xl font-bold text-yellow-400">
            Room {roomId}
          </h1>
          <div className="mb-4 text-lg font-semibold">
            Player: <span className="text-green-300">{name}</span>
          </div>
          <div className="mb-4 text-white/80">
            Number of Rounds: {numberOfRounds}
          </div>
          <div className="mb-4 text-white/80">Mode: {mode}</div>
          {mode === "playlist" && (
            <div className="mb-4 text-white/80">
              Playlists: {playlists.join(", ")}
            </div>
          )}

          <div className="mt-8 text-white/60">
            Game in progress... (TODO: implement full game UI)
          </div>
        </>
      )}
      {gameFinished && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={350}
            recycle={false}
          />
          <div className="text-center">
            <h1 className="mb-8 text-6xl font-bold text-yellow-400">
              🎉 Game Complete! 🎉
            </h1>
            <p className="mb-8 text-2xl">
              You&apos;ve finished all {numberOfRounds} rounds!
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-yellow-400 px-8 py-4 text-lg font-bold text-black hover:bg-yellow-500"
            >
              Back to Menu
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
