// src/app/private/join/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function JoinPrivateRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set room code from URL if provided
  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (roomId) {
      setRoomCode(roomId);
    }
  }, [searchParams]);

  const validateRoomCode = (code: string): boolean => {
    // Check if room exists in localStorage
    const storageKey = `room-${code}-players`;
    const roomData = localStorage.getItem(storageKey);
    return roomData !== null;
  };

  const validatePlayerName = (
    roomCode: string,
    playerName: string,
  ): boolean => {
    // Check if name is already taken in the room
    const storageKey = `room-${roomCode}-players`;
    const roomData = localStorage.getItem(storageKey);
    if (roomData) {
      const players = JSON.parse(roomData);
      return !players.includes(playerName.trim());
    }
    return true;
  };

  const handleJoin = () => {
    if (!roomCode.trim() || !name.trim()) {
      setErrorMessage("Please enter both your name and room code.");
      setShowError(true);
      return;
    }

    setIsLoading(true);

    // Validate room code
    if (!validateRoomCode(roomCode.trim())) {
      setErrorMessage(
        "The room code you entered doesn't exist. Please check the code and try again.",
      );
      setShowError(true);
      setIsLoading(false);
      return;
    }

    // Validate player name
    if (!validatePlayerName(roomCode.trim(), name.trim())) {
      setErrorMessage(
        "A player with this name already exists in the room. Please choose a different name.",
      );
      setShowError(true);
      setIsLoading(false);
      return;
    }

    // Room and name are valid, redirect to room
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

        {/* Error Popup */}
        {showError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 max-w-sm rounded-lg bg-white p-6 text-center">
              <div className="mb-4 text-4xl text-red-500">⚠️</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {errorMessage.includes("name already exists")
                  ? "Name Already Taken"
                  : "Invalid Room Code"}
              </h3>
              <p className="mb-4 text-gray-600">{errorMessage}</p>
              <Button
                onClick={clearError}
                className="bg-pink-500 text-white hover:bg-pink-600"
              >
                OK
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
