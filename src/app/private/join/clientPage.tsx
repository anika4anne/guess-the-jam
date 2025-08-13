"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function JoinPrivateRoomClientPage({
  roomId: _roomId,
}: {
  roomId: string | null;
}) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateRoomCode = (code: string): boolean => {
    try {
      const storageKey = `room-${code}-players`;
      const roomData = localStorage.getItem(storageKey);
      if (!roomData) return false;

      const players = JSON.parse(roomData);
      return Array.isArray(players) && players.length > 0;
    } catch (error) {
      console.error("Error validating room code:", error);
      return false;
    }
  };

  const validatePlayerName = (
    roomCode: string,
    playerName: string,
  ): boolean => {
    try {
      const storageKey = `room-${roomCode}-players`;
      const roomData = localStorage.getItem(storageKey);
      if (!roomData) return true;

      const players = JSON.parse(roomData);
      if (!Array.isArray(players)) return true;

      const normalizedPlayerName = playerName.trim().toLowerCase();
      return !players.some(
        (player: string) => player.toLowerCase() === normalizedPlayerName,
      );
    } catch (error) {
      console.error("Error validating player name:", error);
      return true;
    }
  };

  const handleJoin = () => {
    if (!roomCode.trim() || !name.trim()) {
      setErrorMessage("Please enter both your name and room code.");
      setShowError(true);
      return;
    }

    setIsLoading(true);

    if (!validateRoomCode(roomCode.trim())) {
      setErrorMessage(
        "The room code you entered doesn't exist. Please check the code and try again.",
      );
      setShowError(true);
      setIsLoading(false);
      return;
    }

    if (!validatePlayerName(roomCode.trim(), name.trim())) {
      setErrorMessage(
        "A player with this name already exists in the room. Please choose a different name.",
      );
      setShowError(true);
      setIsLoading(false);
      return;
    }

    router.push(
      `/private/${roomCode.trim()}?name=${encodeURIComponent(name.trim())}`,
    );
  };

  const handleBack = () => {
    router.push("/private");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  const clearError = () => {
    setShowError(false);
    setErrorMessage("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] px-6 text-white">

      <div className="absolute top-6 left-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          ← Back
        </Button>
      </div>

      <h1 className="mb-6 text-4xl font-bold text-pink-300">🎉 Join a Room</h1>

      <div className="space-y-4 rounded-2xl bg-white/10 p-8 text-center shadow-lg backdrop-blur-md">
        <div className="space-y-4">
          <input
            placeholder="Your Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError();
            }}
            onKeyPress={handleKeyPress}
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
          <input
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => {
              setRoomCode(e.target.value);
              clearError();
            }}
            onKeyPress={handleKeyPress}
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>

        <Button
          onClick={handleJoin}
          disabled={isLoading}
          className="w-full bg-pink-500 py-3 font-semibold text-white hover:bg-pink-600"
        >
          {isLoading ? "Joining..." : "Join Room"}
        </Button>

    
        {showError && (
          <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm duration-200">
            <div className="flowing-border animate-in zoom-in-95 relative mx-4 max-w-md text-center duration-200">
              <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-2xl">
                
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                  <div className="text-2xl text-white">⚠️</div>
                </div>

           
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {errorMessage.includes("name already exists")
                    ? "Name Already Taken"
                    : "Invalid Room Code"}
                </h3>

               
                <p className="mb-6 leading-relaxed text-gray-600">
                  {errorMessage}
                </p>

      
                <Button
                  onClick={clearError}
                  className="transform rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-pink-600 hover:to-pink-700"
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .flowing-border {
          --borderWidth: 10px;
          padding: var(--borderWidth);
          border-radius: 1rem;
          background: linear-gradient(
            45deg,
            #ff0080,
            #8000ff,
            #0080ff,
            #00ff80,
            #ff8000,
            #ff0080
          );
          background-size: 400% 400%;
          animation: flowingGradient 3s ease infinite;
          display: inline-block;
        }

        @keyframes flowingGradient {
          0% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 100% 50%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </main>
  );
}
