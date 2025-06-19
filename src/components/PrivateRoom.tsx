"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faBan } from "@fortawesome/free-solid-svg-icons";

interface PrivateRoomProps {
  roomId: string;
}

export function PrivateRoom({ roomId }: PrivateRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [showKickPopup, setShowKickPopup] = useState(false);
  const [playerToKick, setPlayerToKick] = useState("");
  const [showKickedPopup, setShowKickedPopup] = useState(false);
  const [hoveredPlayer, setHoveredPlayer] = useState("");
  const [bannedPlayers, setBannedPlayers] = useState<string[]>([]);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [hoveredForReady, setHoveredForReady] = useState("");
  const [showCopied, setShowCopied] = useState(false);

  // Redirect if no name is provided
  useEffect(() => {
    if (!name) {
      router.push(`/private/join?roomId=${roomId}`);
    }
  }, [name, roomId, router]);

  // Handle player list and determine host
  useEffect(() => {
    if (!name) return;

    const storageKey = `room-${roomId}-players`;
    const bannedKey = `room-${roomId}-banned`;
    const readyKey = `room-${roomId}-ready`;

    // Load existing players, banned players, and ready players
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const banned = JSON.parse(localStorage.getItem(bannedKey) || "[]");
    const ready = JSON.parse(localStorage.getItem(readyKey) || "[]");
    setBannedPlayers(banned);
    setReadyPlayers(ready);

    // Check if current player is banned (case-insensitive)
    const isBanned = banned.some(
      (bannedPlayer: string) =>
        bannedPlayer.toLowerCase() === name.toLowerCase(),
    );

    if (isBanned) {
      setShowKickedPopup(true);
      return;
    }

    // Add current player if not already in list (case-insensitive)
    if (
      !existing.some(
        (player: string) => player.toLowerCase() === name.toLowerCase(),
      )
    ) {
      const updated = [...existing, name];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setPlayers(updated);
    } else {
      setPlayers(existing);
    }

    // Determine if current player is host (first player in the room)
    const isCurrentPlayerHost = existing.length === 0 || existing[0] === name;
    setIsHost(isCurrentPlayerHost);

    // Set up interval to check for updates
    const interval = setInterval(() => {
      const current = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const currentBanned = JSON.parse(localStorage.getItem(bannedKey) || "[]");
      const currentReady = JSON.parse(localStorage.getItem(readyKey) || "[]");
      setPlayers(current);
      setBannedPlayers(currentBanned);
      setReadyPlayers(currentReady);

      // Check if current player was kicked or banned (case-insensitive)
      const isCurrentlyBanned = currentBanned.some(
        (bannedPlayer: string) =>
          bannedPlayer.toLowerCase() === name.toLowerCase(),
      );

      if (
        !current.some(
          (player: string) => player.toLowerCase() === name.toLowerCase(),
        ) ||
        isCurrentlyBanned
      ) {
        setShowKickedPopup(true);
      }
    }, 1000);

    // Clean up on unmount
    return () => {
      clearInterval(interval);
      // Remove player from list when they leave (unless they were kicked/banned)
      if (!showKickedPopup) {
        const current = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const updated = current.filter(
          (p: string) => p.toLowerCase() !== name.toLowerCase(),
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    };
  }, [name, roomId, showKickedPopup]);

  // Check if game is starting and handle countdown
  useEffect(() => {
    const gameStartKey = `room-${roomId}-gameStarting`;

    const checkGameStarting = () => {
      const gameStarting = localStorage.getItem(gameStartKey) === "true";
      setIsGameStarting(gameStarting);
    };

    const interval = setInterval(checkGameStarting, 100);
    return () => clearInterval(interval);
  }, [roomId]);

  // Handle countdown once game is starting
  useEffect(() => {
    if (isGameStarting && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isGameStarting && countdown === 0) {
      router.push(`/playnow?roomId=${roomId}&name=${name}`);
    }
  }, [isGameStarting, countdown, roomId, name, router]);

  // Determine if all players are ready
  const allReady =
    players.length >= 2 && readyPlayers.length === players.length;

  const handleBack = () => {
    router.push("/private");
  };

  const handlePlayerHover = (playerName: string) => {
    if (isHost && name && playerName.toLowerCase() !== name.toLowerCase()) {
      setHoveredPlayer(playerName);
    }
    // Handle hover for ready state
    if (playerName.toLowerCase() === name?.toLowerCase()) {
      setHoveredForReady(playerName);
    }
  };

  const handlePlayerLeave = () => {
    setHoveredPlayer("");
    setHoveredForReady("");
  };

  const handlePlayerClick = (playerName: string) => {
    if (isHost && name && playerName.toLowerCase() !== name.toLowerCase()) {
      setPlayerToKick(playerName);
      setShowKickPopup(true);
    }
    // Handle click for ready state
    if (playerName.toLowerCase() === name?.toLowerCase()) {
      toggleReady();
    }
  };

  const handleKickPlayer = () => {
    const storageKey = `room-${roomId}-players`;
    const current = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updated = current.filter(
      (p: string) => p.toLowerCase() !== playerToKick.toLowerCase(),
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setPlayers(updated);
    setShowKickPopup(false);
    setPlayerToKick("");
  };

  const handleBanPlayer = () => {
    const storageKey = `room-${roomId}-players`;
    const bannedKey = `room-${roomId}-banned`;
    const current = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const currentBanned = JSON.parse(localStorage.getItem(bannedKey) || "[]");

    // Remove from players and add to banned
    const updated = current.filter(
      (p: string) => p.toLowerCase() !== playerToKick.toLowerCase(),
    );
    const updatedBanned = [...currentBanned, playerToKick];

    localStorage.setItem(storageKey, JSON.stringify(updated));
    localStorage.setItem(bannedKey, JSON.stringify(updatedBanned));

    setPlayers(updated);
    setBannedPlayers(updatedBanned);
    setShowKickPopup(false);
    setPlayerToKick("");
  };

  const handleKickedPopupClose = () => {
    setShowKickedPopup(false);
    router.push("/private");
  };

  const toggleReady = () => {
    const readyKey = `room-${roomId}-ready`;
    const currentReady = JSON.parse(localStorage.getItem(readyKey) || "[]");

    if (currentReady.includes(name)) {
      const updated = currentReady.filter((p: string) => p !== name);
      localStorage.setItem(readyKey, JSON.stringify(updated));
      setReadyPlayers(updated);
    } else {
      const updated = [...currentReady, name];
      localStorage.setItem(readyKey, JSON.stringify(updated));
      setReadyPlayers(updated);
    }
  };

  const startGame = () => {
    if (isHost && allReady) {
      const gameStartKey = `room-${roomId}-gameStarting`;
      localStorage.setItem(gameStartKey, "true");
      setIsGameStarting(true);
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy room ID:", err);
    }
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

      {/* Main Content */}
      {isGameStarting ? (
        // Countdown screen (shown to all players)
        <div className="flex flex-col items-center justify-center">
          <div className="animate-pulse bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-8xl font-extrabold text-transparent drop-shadow-lg">
            Starting in {countdown}...
          </div>
        </div>
      ) : (
        // Regular room content
        <>
          <h1 className="mb-6 text-4xl font-extrabold drop-shadow-md">
            🎧 Room <span className="text-green-500">{roomId}</span>
            {isHost && (
              <span className="ml-2 rounded-full bg-yellow-500 px-2 py-1 text-sm text-black">
                Host
              </span>
            )}
          </h1>

          <div className="mb-4 flex items-center gap-2">
            <p className="text-white/80">Share the code to invite friends!</p>
            <Button
              variant="outline"
              onClick={copyRoomId}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              {showCopied ? "Copied!" : "Copy Room ID"}
            </Button>
          </div>

          <div className="mb-8 space-y-2 rounded-xl bg-white/10 p-6 shadow-md">
            <h2 className="text-xl font-semibold text-white">
              Players in Lobby
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {players.map((player, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-center transition-all duration-200 ${
                    hoveredPlayer === player &&
                    isHost &&
                    player.toLowerCase() !== name.toLowerCase()
                      ? "border-2 border-red-400 bg-red-500/20 line-through"
                      : ""
                  } ${
                    isHost && player.toLowerCase() !== name.toLowerCase()
                      ? "hover:bg-red-500/10"
                      : ""
                  } ${
                    readyPlayers.includes(player)
                      ? "text-green-400"
                      : hoveredForReady === player
                        ? "text-purple-400"
                        : "text-white/80"
                  }`}
                  onMouseEnter={() => handlePlayerHover(player)}
                  onMouseLeave={handlePlayerLeave}
                  onClick={() => handlePlayerClick(player)}
                >
                  <div
                    className={`${players[0]?.toLowerCase() === player.toLowerCase() ? "font-bold" : ""}`}
                  >
                    {player}{" "}
                    {player.toLowerCase() === name.toLowerCase() ? "(You)" : ""}
                  </div>
                  {isHost && player.toLowerCase() !== name.toLowerCase() && (
                    <div className="mt-1 text-xs text-yellow-400">
                      Click to kick/ban
                    </div>
                  )}
                  {players[0]?.toLowerCase() === player.toLowerCase() && (
                    <div className="mt-1 text-xs text-yellow-400">Host</div>
                  )}
                  {player.toLowerCase() === name?.toLowerCase() &&
                    !readyPlayers.includes(player) && (
                      <div className="mt-1 text-xs text-purple-400">
                        Hover and click to ready up
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar for ready/start/waiting */}
          <div className="pointer-events-none fixed bottom-0 left-0 flex w-full flex-col items-center pb-6">
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              {/* Host: Start Game */}
              {isHost ? (
                <div className="mb-8 flex flex-col items-center">
                  <Button
                    onClick={startGame}
                    disabled={!allReady}
                    className="mb-4 h-14 w-48 bg-yellow-500 text-xl font-bold text-black hover:bg-yellow-600 disabled:bg-yellow-300"
                  >
                    Start Game
                  </Button>
                </div>
              ) : (
                /* Non-host: Ready/Not Ready and Waiting */
                <>
                  <div
                    className={`rounded-full px-6 py-2 text-lg font-semibold ${readyPlayers.includes(name) ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}
                  >
                    {readyPlayers.includes(name) ? "Ready!" : "Not Ready"}
                  </div>
                  {players.length >= 2 && !allReady && (
                    <div className="mt-1 text-base font-medium text-yellow-300">
                      Waiting for all players to be ready…
                    </div>
                  )}
                  {allReady && (
                    <div className="mt-1 animate-pulse text-base font-medium text-blue-300">
                      Waiting for host to start game…
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Kick/Ban Confirmation Popup */}
      {showKickPopup && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm duration-200">
          <div className="flowing-border animate-in zoom-in-95 relative mx-4 max-w-md text-center duration-200">
            <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-2xl">
              {/* Icon Container */}
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                <div className="flex items-center justify-center text-5xl text-white">
                  😠
                </div>
              </div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Remove Player
              </h3>

              {/* Message */}
              <p className="mb-6 leading-relaxed text-gray-600">
                What would you like to do with{" "}
                <span className="font-semibold text-red-600">
                  {playerToKick}
                </span>
                ?
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleKickPlayer}
                  className="transform rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-orange-700"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} /> Kick (Can
                  Rejoin)
                </Button>
                <Button
                  onClick={handleBanPlayer}
                  className="transform rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-red-600 hover:to-red-700"
                >
                  <FontAwesomeIcon icon={faBan} /> Ban (Cannot Rejoin)
                </Button>
                <Button
                  onClick={() => setShowKickPopup(false)}
                  className="rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white transition-all duration-200 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kicked Out Popup */}
      {showKickedPopup && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm duration-200">
          <div className="flowing-border animate-in zoom-in-95 relative mx-4 max-w-md text-center duration-200">
            <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-2xl">
              {/* Icon Container */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                <div className="text-2xl text-white">🚪</div>
              </div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {bannedPlayers.some(
                  (bannedPlayer: string) =>
                    bannedPlayer.toLowerCase() === name.toLowerCase(),
                )
                  ? "You Have Been Banned"
                  : "You've Been Kicked"}
              </h3>

              {/* Message */}
              <p className="mb-6 leading-relaxed text-gray-600">
                {bannedPlayers.some(
                  (bannedPlayer: string) =>
                    bannedPlayer.toLowerCase() === name.toLowerCase(),
                )
                  ? "You have been banned from this room and cannot rejoin."
                  : "The host has kicked you from the room."}
              </p>

              {/* Action Button */}
              <Button
                onClick={handleKickedPopupClose}
                className="transform rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-blue-700"
              >
                Return to Lobby
              </Button>
            </div>
          </div>
        </div>
      )}

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
