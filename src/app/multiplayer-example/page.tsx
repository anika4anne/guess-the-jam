"use client";

import { useState } from "react";
import { MultiplayerGame } from "~/components/MultiplayerGame";
import { Button } from "~/components/ui/button";

export default function MultiplayerExamplePage() {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isInGame, setIsInGame] = useState(false);

  const handleJoinGame = () => {
    if (roomId.trim() && playerName.trim()) {
      setIsInGame(true);
    }
  };

  const handleGameEnd = (finalScores: Record<string, number>) => {
    console.log("Game ended with scores:", finalScores);
    setIsInGame(false);
  };

  if (isInGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f29] via-[#0d1a40] to-[#010314]">
        <div className="absolute top-6 left-6">
          <Button
            onClick={() => setIsInGame(false)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ← Back to Setup
          </Button>
        </div>
        
        <MultiplayerGame
          roomId={roomId}
          playerName={playerName}
          onGameEnd={handleGameEnd}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0f29] via-[#0d1a40] to-[#010314] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 Multiplayer Game</h1>
          <p className="text-gray-300">Join a game room to start playing!</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Room ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
              placeholder="Enter room ID..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
              placeholder="Enter your name..."
            />
          </div>

          <Button
            onClick={handleJoinGame}
            disabled={!roomId.trim() || !playerName.trim()}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Game
          </Button>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>Make sure the game server is running and accessible.</p>
          <p>Default: ws://localhost:3001</p>
        </div>
      </div>
    </main>
  );
}
