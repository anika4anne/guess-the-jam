"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "~/components/ui/button";

import { useWebSocket } from "~/hooks/useWebSocket";

interface PrivateRoomProps {
  roomId: string;
}

interface Player {
  id: string;
  name: string;
  ready: boolean;
  score: number;
}

export function PrivateRoom({ roomId }: PrivateRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [showKickPopup, setShowKickPopup] = useState(false);
  const [playerToKick, setPlayerToKick] = useState("");
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showCopied, setShowCopied] = useState(false);
  const [rounds, setRounds] = useState<number>(10);
  const [mode, setMode] = useState<"default" | "playlist">("default");
  const [playlists, setPlaylists] = useState<string[]>([""]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [playerId, setPlayerId] = useState<string>("");

  const isMounted = useRef(true);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirected = useRef(false);

  const { sendMessage, lastMessage, connect, disconnect } = useWebSocket();

  useEffect(() => {
    if (!name) {
      router.push(`/private/join?roomId=${roomId}`);
      return;
    }

    connect(roomId, name);

    return () => {
      disconnect();
    };
  }, [name, roomId, connect, disconnect, router]);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "room_joined":
        if (lastMessage.playerId) {
          setPlayerId(lastMessage.playerId);
        }
        if (lastMessage.room) {
          setPlayers(lastMessage.room.players);
          if (lastMessage.playerId) {
            setIsHost(lastMessage.room.hostId === lastMessage.playerId);
          }
        }
        break;

      case "player_joined":
        if (lastMessage.player) {
          setPlayers((prev) => [...prev, lastMessage.player as Player]);
        }
        break;

      case "player_left":
        if (lastMessage.playerId) {
          setPlayers((prev) =>
            prev.filter((p) => p.id !== lastMessage.playerId),
          );
        }
        break;

      case "player_ready_update":
        if (lastMessage.playerId && typeof lastMessage.ready === "boolean") {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === lastMessage.playerId
                ? { ...p, ready: lastMessage.ready! }
                : p,
            ),
          );
          setReadyPlayers((prev) => {
            if (lastMessage.ready && lastMessage.playerId) {
              return prev.includes(lastMessage.playerId)
                ? prev
                : [...prev, lastMessage.playerId];
            } else if (lastMessage.playerId) {
              return prev.filter((id) => id !== lastMessage.playerId);
            }
            return prev;
          });
        }
        break;

      case "all_players_ready":
        break;

      case "game_starting":
        setIsGameStarting(true);
        if (typeof lastMessage.countdown === "number") {
          setCountdown(lastMessage.countdown);
        }
        break;

      case "countdown_update":
        if (typeof lastMessage.countdown === "number") {
          setCountdown(lastMessage.countdown);
        }
        break;

      case "gameplay_started":
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.push(`/playnow?name=${name}&roomId=${roomId}`);
        }
        break;

      case "new_host":
        if (lastMessage.hostId === playerId) {
          setIsHost(true);
        }
        break;

      case "player_kicked":
        setPlayers((prev) => prev.filter((p) => p.id !== lastMessage.playerId));
        break;

      case "player_banned":
        setPlayers((prev) => prev.filter((p) => p.id !== lastMessage.playerId));
        break;
    }
  }, [lastMessage, playerId, name, roomId, router]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  const handleReadyToggle = useCallback(() => {
    const isReady = readyPlayers.includes(playerId);
    sendMessage({
      type: "player_ready",
      ready: !isReady,
    });
  }, [playerId, readyPlayers, sendMessage]);

  const handleStartGame = useCallback(() => {
    if (!isHost) return;

    sendMessage({
      type: "start_game",
    });
  }, [isHost, sendMessage]);

  const handleKickPlayer = useCallback(
    (targetPlayerId: string) => {
      sendMessage({
        type: "kick_player",
        targetPlayerId,
      });
      setShowKickPopup(false);
      setPlayerToKick("");
    },
    [sendMessage],
  );

  const handleBanPlayer = useCallback(
    (targetPlayerId: string) => {
      sendMessage({
        type: "ban_player",
        targetPlayerId,
      });
      setShowKickPopup(false);
      setPlayerToKick("");
    },
    [sendMessage],
  );

  const handleSettingsUpdate = useCallback(
    (settings: Record<string, unknown>) => {
      if (!isHost) return;

      sendMessage({
        type: "game_settings_update",
        settings,
      });
    },
    [isHost, sendMessage],
  );

  const copyRoomCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy room code:", error);
    }
  }, [roomId]);

  const handleAddYear = useCallback(
    (year: number) => {
      const newYears = selectedYears.concat([year]);
      setSelectedYears(newYears);
      handleSettingsUpdate({ selectedYears: newYears });
    },
    [selectedYears, handleSettingsUpdate],
  );

  const handleDeleteYear = useCallback(
    (year: number) => {
      const newYears = selectedYears.filter((y) => y !== year);
      setSelectedYears(newYears);
      handleSettingsUpdate({ selectedYears: newYears });
    },
    [selectedYears, handleSettingsUpdate],
  );

  if (!name) {
    return null;
  }

  if (false) {
    return (
      <div className="lobby-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-red-400">
            You have been kicked from this room
          </h1>
          <Button
            onClick={() => router.push("/private")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Private Rooms
          </Button>
        </div>
      </div>
    );
  }

  const canStartGame =
    isHost && readyPlayers.length === players.length && players.length > 1;

  return (
    <main className="lobby-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="mb-6 rotate-1 transform text-5xl font-extrabold drop-shadow-lg">
          Room <span className="text-green-400">{roomId}</span>
        </h1>

        <div className="mb-6 text-center">
          <div className="mb-4">
            <span className="text-lg font-medium text-white/90">
              Share the code with your friends:
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="rounded-lg bg-black/30 px-4 py-2 font-mono text-lg">
              {roomId}
            </div>
            <Button
              onClick={copyRoomCode}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {showCopied ? "Copied!" : "Copy Room ID"}
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div
            className="group cursor-pointer rounded-xl bg-white/10 px-6 py-4 shadow-md transition-all duration-200 select-none hover:bg-white/15"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="fas fa-cog text-white"></i>
                <span className="text-lg font-semibold">Game Settings</span>
              </div>
              <span
                className={`transform transition-transform duration-200 ${
                  settingsOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </div>
          </div>

          {settingsOpen && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Number of Rounds:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rounds}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setRounds(value);
                    handleSettingsUpdate({ rounds: value });
                  }}
                  className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Game Mode:
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setMode("default");
                      handleSettingsUpdate({ mode: "default" });
                    }}
                    className={`${
                      mode === "default"
                        ? "bg-pink-400 text-black"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    Default
                  </Button>
                  <Button
                    onClick={() => {
                      setMode("playlist");
                      handleSettingsUpdate({ mode: "playlist" });
                    }}
                    className={`${
                      mode === "playlist"
                        ? "bg-pink-400 text-black"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    Playlist
                  </Button>
                </div>
              </div>

              {mode === "playlist" && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">
                    Playlists:
                  </label>
                  {playlists.map((playlist, index) => (
                    <div key={index} className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={playlist}
                        onChange={(e) => {
                          const newPlaylists = playlists.concat([]);
                          newPlaylists[index] = e.target.value;
                          setPlaylists(newPlaylists);
                          handleSettingsUpdate({ playlists: newPlaylists });
                        }}
                        placeholder="Enter playlist URL"
                        className="flex-1 rounded border border-white/20 bg-white/10 px-3 py-2 text-white"
                      />
                      <Button
                        onClick={() => {
                          const newPlaylists = playlists.filter(
                            (_, i) => i !== index,
                          );
                          setPlaylists(newPlaylists);
                          handleSettingsUpdate({ playlists: newPlaylists });
                        }}
                        className="bg-red-600 px-3 hover:bg-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      const newPlaylists = playlists.concat([""]);
                      setPlaylists(newPlaylists);
                      handleSettingsUpdate({ playlists: newPlaylists });
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add Playlist
                  </Button>
                </div>
              )}

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Selected Years:
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedYears.map((year) => (
                    <div
                      key={year}
                      className="flex items-center gap-2 rounded-full bg-pink-400/20 px-3 py-1"
                    >
                      <span>{year}</span>
                      <button
                        onClick={() => handleDeleteYear(year)}
                        className="text-pink-400 hover:text-pink-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {[2020, 2021, 2022, 2023, 2024].map((year) => (
                    <Button
                      key={year}
                      onClick={() => handleAddYear(year)}
                      disabled={selectedYears.includes(year)}
                      className={`${
                        selectedYears.includes(year)
                          ? "cursor-not-allowed bg-gray-600"
                          : "bg-pink-400 text-black hover:bg-pink-500"
                      }`}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-center text-2xl font-bold">
            Players in Lobby ({players.length})
          </h2>
          <div className="grid gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-lg bg-white/10 p-4"
                onMouseEnter={() => undefined}
                onMouseLeave={() => undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{player.name}</span>
                  {player.id === playerId && (
                    <span className="rounded bg-pink-500 px-2 py-1 text-xs text-white">
                      You
                    </span>
                  )}
                  {isHost && player.id === playerId && (
                    <span className="rounded bg-yellow-500 px-2 py-1 text-xs text-black">
                      Host
                    </span>
                  )}
                  {player.ready && (
                    <span className="rounded bg-green-500 px-2 py-1 text-xs text-white">
                      Ready
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {player.id !== playerId && (
                    <Button
                      onClick={() => handleReadyToggle()}
                      className={`${
                        readyPlayers.includes(player.id)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      {readyPlayers.includes(player.id) ? "Ready" : "Not Ready"}
                    </Button>
                  )}

                  {isHost && player.id !== playerId && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setPlayerToKick(player.id);
                          setShowKickPopup(true);
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        Kick
                      </Button>
                      <Button
                        onClick={() => {
                          setPlayerToKick(player.id);
                          setShowKickPopup(true);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        Ban
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div className="text-center">
            <Button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className={`${
                canStartGame
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "cursor-not-allowed bg-gray-600"
              } px-8 py-3 text-lg font-semibold`}
            >
              Start Game
            </Button>
            {!canStartGame && (
              <p className="mt-2 text-sm text-white/70">
                {players.length <= 1
                  ? "Need at least 2 players to start"
                  : "All players must be ready to start"}
              </p>
            )}
          </div>
        )}

        {!isHost && (
          <div className="text-center">
            <p className="text-lg text-white/90">
              Waiting for host to start the game
            </p>
          </div>
        )}

        {isGameStarting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <h2 className="mb-4 text-4xl font-bold">
                Starting in {countdown} seconds
              </h2>
              <div className="text-6xl font-bold text-pink-400">
                {countdown}
              </div>
            </div>
          </div>
        )}
      </div>

      {showKickPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm">
            <div className="relative rounded-lg border border-red-500 bg-red-700 p-5">
              <button
                onClick={() => setShowKickPopup(false)}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center text-xl font-bold text-white hover:text-red-200"
              >
                ×
              </button>

              <div className="text-center">
                <div className="mb-3 text-3xl">⚠️</div>

                <h3 className="mb-2 text-lg font-bold text-white">
                  Remove Player
                </h3>

                <p className="mb-4 text-white/90">
                  Are you sure you want to remove this player from the room?
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleKickPlayer(playerToKick)}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                  >
                    Kick
                  </Button>
                  <Button
                    onClick={() => handleBanPlayer(playerToKick)}
                    className="w-full bg-red-500 text-white hover:bg-red-600"
                  >
                    Ban
                  </Button>
                  <Button
                    onClick={() => setShowKickPopup(false)}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
