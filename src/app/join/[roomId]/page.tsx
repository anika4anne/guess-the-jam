"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Confetti from "react-confetti";
import { Button } from "~/components/ui/button";

// TODO: Sync game state between players using localStorage or backend

interface Song {
  title: string;
  artist: string;
}

export default function JoinRoomGamePage({
  params,
}: {
  params: { roomId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = params.roomId;
  const name = searchParams.get("name") || "";

  // Get settings from localStorage
  const [numberOfRounds, setNumberOfRounds] = useState(10);
  const [mode, setMode] = useState<"default" | "playlist">("default");
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [round, setRound] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);

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
    // TODO: Fetch songs based on settings
  }, [roomId]);

  // TODO: Add the rest of the Play Now game logic (song selection, scoring, prompts, etc.)

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
          {/* TODO: Add the rest of the game UI and logic here (song, prompt, scoring, etc.) */}
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
              You've finished all {numberOfRounds} rounds!
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
