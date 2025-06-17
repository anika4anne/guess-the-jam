"use client";

import { useState } from "react";

export default function PrivateRoom({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = params;
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState(["You"]);
  const [gameStarted, setGameStarted] = useState(false);

  const roomLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/private/${roomId}`
      : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 text-white">
      <h1 className="mb-6 text-4xl font-extrabold drop-shadow-md">
        🎧 Welcome to Room <span className="text-green-700">{roomId}</span>
      </h1>
      <p className="mb-4 text-lg text-white/80">
        Share this link with your friends to invite them to the game!
      </p>

      <div className="mb-10 flex flex-col items-center gap-2">
        <code className="rounded bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur">
          {roomLink}
        </code>
        <button
          onClick={handleCopy}
          className="rounded-md bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {!gameStarted ? (
        <>
          <h2 className="mb-4 text-2xl font-semibold">Lobby</h2>
          <ul className="mb-6 rounded bg-white/10 px-6 py-4 text-left text-white/80 shadow-md backdrop-blur-sm">
            {players.map((player, index) => (
              <li key={index}>👤 {player}</li>
            ))}
          </ul>
          <button
            onClick={() => setGameStarted(true)}
            className="rounded-md bg-blue-500 px-6 py-2 font-semibold text-white transition hover:bg-blue-600"
          >
            Start Game
          </button>
        </>
      ) : (
        <div className="mt-6 text-xl text-green-400">🎮 Game Started!</div>
      )}
    </main>
  );
}
