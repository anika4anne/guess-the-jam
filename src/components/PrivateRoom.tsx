"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "~/components/ui/button";

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

  const [showLeavePrompt, setShowLeavePrompt] = useState(false);

  const [isGameStarting, setIsGameStarting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showCopied, setShowCopied] = useState(false);
  const [rounds, setRounds] = useState<number>(10);
  const [mode, setMode] = useState<"default" | "playlist" | "chat">("default");
  const [playlists, setPlaylists] = useState<string[]>([""]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [playerId, setPlayerId] = useState<string>("");
  const [currentHostId, setCurrentHostId] = useState<string>("");

  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: "join" | "leave" | "kick" | "ban";
      timestamp: number;
    }>
  >([]);

  const isMounted = useRef(true);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!name) {
      router.push(`/private/join?roomId=${roomId}`);
      return;
    }

    const roomData = localStorage.getItem(`room_${roomId}`);
    if (roomData) {
      const parsed = JSON.parse(roomData);
      setPlayers(parsed.players ?? []);
      setCurrentHostId(parsed.hostId ?? "");
      setRounds(parsed.rounds ?? 10);
      setMode(parsed.mode ?? "default");
      setPlaylists(parsed.playlists ?? [""]);
      setSelectedYears(parsed.selectedYears ?? []);
    } else {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: name,
        ready: false,
        score: 0,
      };
      const newRoom = {
        players: [newPlayer],
        hostId: newPlayer.id,
        rounds: 10,
        mode: "default",
        playlists: [""],
        selectedYears: [],
      };
      localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
      setPlayers([newPlayer]);
      setCurrentHostId(newPlayer.id);
      setPlayerId(newPlayer.id);
      setIsHost(true);
    }

    const pollInterval = setInterval(() => {
      const roomData = localStorage.getItem(`room_${roomId}`);
      if (roomData) {
        const parsed = JSON.parse(roomData);
        setPlayers(parsed.players ?? []);
        setCurrentHostId(parsed.hostId ?? "");
        setRounds(parsed.rounds ?? 10);
        setMode(parsed.mode ?? "default");
        setPlaylists(parsed.playlists ?? [""]);
        setSelectedYears(parsed.selectedYears ?? []);
      }
    }, 1000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [name, roomId, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications((prev) => prev.filter((n) => now - n.timestamp < 30000));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) =>
        prev.filter(
          (notification) => Date.now() - notification.timestamp < 5000,
        ),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReadyToggle = useCallback(() => {
    const currentPlayer = players.find((p) => p.id === playerId);
    const isReady = currentPlayer?.ready ?? false;

    const roomData = localStorage.getItem(`room_${roomId}`);
    if (roomData) {
      const parsed = JSON.parse(roomData);
      const updatedPlayers = parsed.players.map((p: Player) =>
        p.id === playerId ? { ...p, ready: !isReady } : p,
      );
      const updatedRoom = { ...parsed, players: updatedPlayers };
      localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoom));
    }
  }, [playerId, players, roomId]);

  const handleStartGame = useCallback(() => {
    if (!isHost) return;

    const gameSettings = {
      years: selectedYears,
      rounds,
      playerNames: players.map((p) => p.name),
      mode,
      playlists: mode === "playlist" ? playlists : [],
    };

    localStorage.setItem("privateRoomSettings", JSON.stringify(gameSettings));

    setIsGameStarting(true);
    setCountdown(5);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push(`/playnow?name=${name}&roomId=${roomId}&mode=${mode}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [
    isHost,
    selectedYears,
    rounds,
    players,
    mode,
    playlists,
    name,
    roomId,
    router,
  ]);

  const handleKickPlayer = useCallback(
    (targetPlayerId: string) => {
      const roomData = localStorage.getItem(`room_${roomId}`);
      if (roomData) {
        const parsed = JSON.parse(roomData);
        const updatedPlayers = parsed.players.filter(
          (p: Player) => p.id !== targetPlayerId,
        );
        const updatedRoom = { ...parsed, players: updatedPlayers };
        localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoom));
      }
      setShowKickPopup(false);
      setPlayerToKick("");
    },
    [roomId],
  );

  const handleSettingsUpdate = useCallback(
    (settings: Record<string, unknown>) => {
      if (!isHost) return;

      const roomData = localStorage.getItem(`room_${roomId}`);
      if (roomData) {
        const parsed = JSON.parse(roomData);
        const updatedRoom = { ...parsed, ...settings };
        localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoom));
      }
    },
    [isHost, roomId],
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
    isHost &&
    players.every((player) => player.ready) &&
    players.length > 1 &&
    selectedYears.length === 1 &&
    mode !== undefined;

  return (
    <main className="lobby-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="mb-6 rotate-1 transform text-5xl font-extrabold drop-shadow-lg">
          Room <span className="text-green-400">{roomId}</span>
        </h1>

        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`transform transition-all duration-500 ease-out ${
                notification.type === "join"
                  ? "bg-green-500 text-lg font-semibold"
                  : notification.type === "leave"
                    ? "bg-yellow-500"
                    : notification.type === "kick"
                      ? "bg-orange-500"
                      : "bg-red-500"
              } max-w-xs rounded-lg px-4 py-2 text-white shadow-lg`}
              style={{
                animation: "slideInRight 0.5s ease-out",
              }}
            >
              {notification.message}
            </div>
          ))}
        </div>

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

        {isHost && (
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
                  {isHost ? (
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
                  ) : (
                    <div className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white">
                      {rounds}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">
                    Game Mode:
                  </label>
                  {isHost ? (
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
                      <Button
                        onClick={() => {
                          setMode("chat");
                          handleSettingsUpdate({ mode: "chat" });
                        }}
                        className={`${
                          mode === "chat"
                            ? "bg-pink-400 text-black"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                      >
                        Chat Guess
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white">
                      {mode === "default"
                        ? "Default"
                        : mode === "playlist"
                          ? "Playlist"
                          : "Chat Guess"}
                    </div>
                  )}
                </div>

                {mode === "playlist" && (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">
                      Playlists:
                    </label>
                    {isHost ? (
                      <>
                        {playlists.map((playlist, index) => (
                          <div key={index} className="mb-2 flex gap-2">
                            <input
                              type="text"
                              value={playlist}
                              onChange={(e) => {
                                const newPlaylists = playlists.concat([]);
                                newPlaylists[index] = e.target.value;
                                setPlaylists(newPlaylists);
                                handleSettingsUpdate({
                                  playlists: newPlaylists,
                                });
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
                                handleSettingsUpdate({
                                  playlists: newPlaylists,
                                });
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
                      </>
                    ) : (
                      <div className="space-y-2">
                        {playlists.map((playlist, index) => (
                          <div
                            key={index}
                            className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white"
                          >
                            {playlist || "No playlist URL"}
                          </div>
                        ))}
                        {playlists.length === 0 && (
                          <div className="text-gray-400 italic">
                            No playlists configured
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {mode === "chat" && (
                  <div className="mb-4 rounded-lg border border-white/20 bg-white/5 p-4">
                    <h4 className="mb-2 text-sm font-medium text-pink-400">
                      Chat Guess Mode
                    </h4>
                    <p className="text-sm text-white/80">
                      Players guess song names through chat. Only song names
                      count - no artist names needed. First player to guess
                      correctly gets points and the round continues until time
                      runs out.
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">
                    Selected Year:
                  </label>
                  {isHost ? (
                    <select
                      value={selectedYears[0] ?? ""}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        if (year) {
                          setSelectedYears([year]);
                          handleSettingsUpdate({ selectedYears: [year] });
                        }
                      }}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-pink-400 focus:outline-none"
                    >
                      <option value="">Select a year</option>
                      {[
                        2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
                        2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017,
                        2018, 2019, 2020, 2021, 2022, 2023, 2024,
                      ].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mb-2">
                      {selectedYears.length > 0 ? (
                        <span className="rounded-full bg-pink-400/20 px-3 py-1 text-white">
                          {selectedYears[0]}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">
                          No year selected
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-8 rounded-lg bg-white/5 p-4">
          <h3 className="mb-3 text-lg font-semibold text-white">
            Current Game Settings
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Mode:</span>
              <span className="ml-2 text-white">
                {mode === "default"
                  ? "Default"
                  : mode === "playlist"
                    ? "Playlist"
                    : "Chat Guess"}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Rounds:</span>
              <span className="ml-2 text-white">{rounds}</span>
            </div>
            <div>
              <span className="text-gray-300">Year:</span>
              <span className="ml-2 text-white">
                {selectedYears.length > 0 ? selectedYears[0] : "None selected"}
              </span>
            </div>
            {mode === "playlist" && (
              <div>
                <span className="text-gray-300">Playlists:</span>
                <span className="ml-2 text-white">
                  {playlists.length > 0
                    ? `${playlists.length} playlist(s)`
                    : "None configured"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-center text-2xl font-bold">
            Players in Lobby ({players.length})
          </h2>

          {players.find((p) => p.id === playerId)?.ready === false && (
            <div className="mb-4 text-center">
              <p className="rounded-lg border border-white/20 bg-white/10 p-3 text-sm text-white/70">
                <strong>Tip:</strong> Click on the &quot;Not Ready&quot; button
                to make yourself ready and start the game!
              </p>
            </div>
          )}

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
                  {player.id === currentHostId && (
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
                  {player.id === playerId && (
                    <Button
                      onClick={handleReadyToggle}
                      className={`${
                        player.ready
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                      size="sm"
                    >
                      {player.ready ? "Ready" : "Not Ready"}
                    </Button>
                  )}

                  {player.id !== playerId && (
                    <div
                      className={`rounded px-3 py-2 text-sm font-medium ${
                        player.ready
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {player.ready ? "Ready" : "Not Ready"}
                    </div>
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
                  ? "animate-pulse bg-yellow-500 text-black shadow-lg shadow-yellow-500/50 hover:bg-yellow-600"
                  : "cursor-not-allowed bg-gray-600"
              } px-8 py-3 text-lg font-semibold transition-all duration-300`}
            >
              {canStartGame ? "🚀 Start Game!" : "Start Game"}
            </Button>
            {!canStartGame && (
              <p className="mt-2 text-sm text-white/70">
                {players.length <= 1
                  ? "Need at least 2 players to start"
                  : selectedYears.length !== 1
                    ? "Host must select exactly one year"
                    : mode === undefined
                      ? "Host must select a game mode"
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

      <div className="mt-8 text-center">
        <Button
          onClick={() => setShowLeavePrompt(true)}
          className="bg-red-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-red-700"
        >
          Leave Room
        </Button>
      </div>

      {showKickPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm">
            <div className="relative rounded-lg border border-red-500 bg-red-700 p-5">
              <button
                onClick={() => {
                  setShowKickPopup(false);
                  setPlayerToKick("");
                }}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center text-xl font-bold text-white hover:text-red-200"
              >
                ×
              </button>

              <div className="text-center">
                <div className="mb-3 text-3xl">⚠️</div>

                <h3 className="mb-2 text-lg font-bold text-white">
                  Kick Player
                </h3>

                <p className="mb-4 text-white/90">
                  Are you sure you want to kick this player from the room?
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleKickPlayer(playerToKick)}
                    className="w-full bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Kick
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm">
            <div className="relative rounded-lg border border-red-500 bg-red-700 p-5">
              <button
                onClick={() => setShowLeavePrompt(false)}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center text-xl font-bold text-white hover:text-red-200"
              >
                ×
              </button>

              <div className="text-center">
                <div className="mb-3 text-3xl">🚪</div>

                <h3 className="mb-2 text-lg font-bold text-white">
                  Leave Room
                </h3>

                <p className="mb-4 text-white/90">
                  Are you sure you want to leave this room?
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      router.push("/");
                      setShowLeavePrompt(false);
                    }}
                    className="w-full bg-red-500 text-white hover:bg-red-600"
                  >
                    Yes, Leave
                  </Button>
                  <Button
                    onClick={() => setShowLeavePrompt(false)}
                    className="w-full bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Stay
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
