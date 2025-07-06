"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faBan } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

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
  const [showScore, setShowScore] = useState(false);
  const [gameMode, setGameMode] = useState("single");
  const [score, setScore] = useState(0);
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [rounds, setRounds] = useState<number>(10);
  const [mode, setMode] = useState<"default" | "playlist">("default");
  const [playlists, setPlaylists] = useState<string[]>([""]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  useEffect(() => {
    if (!name) {
      router.push(`/private/join?roomId=${roomId}`);
    }
  }, [name, roomId, router]);

  useEffect(() => {
    if (!name) return;

    const storageKey = `room-${roomId}-players`;
    const bannedKey = `room-${roomId}-banned`;
    const readyKey = `room-${roomId}-ready`;

    const existing = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    const banned = JSON.parse(localStorage.getItem(bannedKey) ?? "[]");
    const ready = JSON.parse(localStorage.getItem(readyKey) ?? "[]");
    setBannedPlayers(banned);
    setReadyPlayers(ready);

    const isBanned = banned.some(
      (bannedPlayer: string) =>
        bannedPlayer.toLowerCase() === name.toLowerCase(),
    );

    if (isBanned) {
      setShowKickedPopup(true);
      return;
    }

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

    const isCurrentPlayerHost = existing.length === 0 || existing[0] === name;
    setIsHost(isCurrentPlayerHost);

    const interval = setInterval(() => {
      const current = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      const currentBanned = JSON.parse(localStorage.getItem(bannedKey) ?? "[]");
      const currentReady = JSON.parse(localStorage.getItem(readyKey) ?? "[]");
      setPlayers(current);
      setBannedPlayers(currentBanned);
      setReadyPlayers(currentReady);

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

    return () => {
      clearInterval(interval);

      if (!showKickedPopup) {
        const current = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
        const updated = current.filter(
          (p: string) => p.toLowerCase() !== name.toLowerCase(),
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    };
  }, [name, roomId, showKickedPopup]);

  useEffect(() => {
    const gameStartKey = `room-${roomId}-gameStarting`;

    const checkGameStarting = () => {
      const gameStarting = localStorage.getItem(gameStartKey) === "true";
      setIsGameStarting(gameStarting);
    };

    const interval = setInterval(checkGameStarting, 100);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    if (isGameStarting && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isGameStarting && countdown === 0) {
      router.push(
        `/playnow?name=${encodeURIComponent(name ?? "")}&roomId=${roomId}`,
      );
    }
  }, [isGameStarting, countdown, roomId, name, router]);

  useEffect(() => {
    if (!name) return;
    setIsHost(players[0]?.toLowerCase() === name.toLowerCase());
  }, [players, name]);

  useEffect(() => {
    const roundsKey = `room-${roomId}-rounds`;
    const stored = localStorage.getItem(roundsKey);
    if (stored) setRounds(Number(stored));
    const interval = setInterval(() => {
      const updated = localStorage.getItem(roundsKey);
      if (updated && Number(updated) !== rounds) setRounds(Number(updated));
    }, 500);
    return () => clearInterval(interval);
  }, [roomId, rounds]);

  useEffect(() => {
    const modeKey = `room-${roomId}-mode`;
    const playlistsKey = `room-${roomId}-playlists`;
    const storedMode = localStorage.getItem(modeKey);
    if (storedMode === "playlist" || storedMode === "default")
      setMode(storedMode);
    const storedPlaylists = localStorage.getItem(playlistsKey);
    if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));
    const interval = setInterval(() => {
      const updatedMode = localStorage.getItem(modeKey);
      if (
        (updatedMode === "playlist" || updatedMode === "default") &&
        updatedMode !== mode
      )
        setMode(updatedMode);
      const updatedPlaylists = localStorage.getItem(playlistsKey);
      if (
        updatedPlaylists &&
        JSON.stringify(JSON.parse(updatedPlaylists)) !==
          JSON.stringify(playlists)
      )
        setPlaylists(JSON.parse(updatedPlaylists));
    }, 500);
    return () => clearInterval(interval);
  }, [roomId, mode, playlists]);

  useEffect(() => {
    const yearsKey = `room-${roomId}-years`;
    const stored = localStorage.getItem(yearsKey);
    if (stored) setSelectedYears(JSON.parse(stored));
    const interval = setInterval(() => {
      const updated = localStorage.getItem(yearsKey);
      if (
        updated &&
        JSON.stringify(JSON.parse(updated)) !== JSON.stringify(selectedYears)
      )
        setSelectedYears(JSON.parse(updated));
    }, 500);
    return () => clearInterval(interval);
  }, [roomId]);

  const allReady =
    players.length >= 2 && readyPlayers.length === players.length;

  const handleBack = () => {
    router.push("/private");
  };

  const handlePlayerHover = (playerName: string) => {
    if (isHost && name && playerName.toLowerCase() !== name.toLowerCase()) {
      setHoveredPlayer(playerName);
    }

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

    if (playerName.toLowerCase() === name?.toLowerCase()) {
      toggleReady();
    }
  };

  const handleKickPlayer = () => {
    const storageKey = `room-${roomId}-players`;
    const current = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
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
    const current = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    const currentBanned = JSON.parse(localStorage.getItem(bannedKey) ?? "[]");

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
    const currentReady = JSON.parse(localStorage.getItem(readyKey) ?? "[]");

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
      if (mode === "default" && selectedYears.length === 0) {
        alert("Please select at least one year before starting the game.");
        return;
      }
      if (
        mode === "playlist" &&
        (!playlists.length || playlists.every((p) => !p.trim()))
      ) {
        alert("Please enter at least one playlist before starting the game.");
        return;
      }
      const privateRoomSettings = {
        years: selectedYears,
        rounds,
        playerNames: players,
        mode,
        playlists,
      };
      localStorage.setItem(
        "privateRoomSettings",
        JSON.stringify(privateRoomSettings),
      );
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

  const handleRoundsChange = (value: number) => {
    const roundsKey = `room-${roomId}-rounds`;
    setRounds(value);
    localStorage.setItem(roundsKey, String(value));
  };

  const handleModeChange = (val: "default" | "playlist") => {
    const modeKey = `room-${roomId}-mode`;
    setMode(val);
    localStorage.setItem(modeKey, val);
  };

  const handlePlaylistChange = (idx: number, value: string) => {
    const playlistsKey = `room-${roomId}-playlists`;
    const updated = [...playlists];
    updated[idx] = value;
    setPlaylists(updated);
    localStorage.setItem(playlistsKey, JSON.stringify(updated));
  };

  const handleAddPlaylist = () => {
    const playlistsKey = `room-${roomId}-playlists`;
    const updated = [...playlists, ""];
    setPlaylists(updated);
    localStorage.setItem(playlistsKey, JSON.stringify(updated));
  };

  const handleRemovePlaylist = (idx: number) => {
    const playlistsKey = `room-${roomId}-playlists`;
    const updated = playlists.filter((_, i) => i !== idx);
    setPlaylists(updated.length ? updated : [""]);
    localStorage.setItem(
      playlistsKey,
      JSON.stringify(updated.length ? updated : [""]),
    );
  };

  const startDecrement = () => {
    if (rounds > 1) handleRoundsChange(rounds - 1);
  };

  const startIncrement = () => {
    if (rounds < 100) handleRoundsChange(rounds + 1);
  };

  const handleAddYear = (year: number) => {
    const yearsKey = `room-${roomId}-years`;
    if (!selectedYears.includes(year)) {
      const updated = [...selectedYears, year];
      setSelectedYears(updated);
      localStorage.setItem(yearsKey, JSON.stringify(updated));
    }
  };

  const handleDeleteYear = (year: number) => {
    const yearsKey = `room-${roomId}-years`;
    const updated = selectedYears.filter((y) => y !== year);
    setSelectedYears(updated);
    localStorage.setItem(yearsKey, JSON.stringify(updated));
  };

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
        <div className="flex flex-col items-center justify-center">
          <div className="animate-pulse bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-8xl font-extrabold text-transparent drop-shadow-lg">
            Starting in {countdown}...
          </div>
        </div>
      ) : (
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

          {/* Collapsible Game Settings box - only for host */}
          {isHost && (
            <div className="mx-auto mb-6 w-full max-w-md">
              <div
                className="flex cursor-pointer items-center justify-between rounded-t-xl bg-white/10 px-6 py-3 shadow-md select-none"
                onClick={() => setSettingsOpen((open) => !open)}
                role="button"
                tabIndex={0}
                aria-expanded={settingsOpen}
              >
                <span className="flex items-center gap-2 text-lg font-bold text-white">
                  Game Settings{" "}
                  <span role="img" aria-label="settings">
                    ⚙️
                  </span>
                </span>
                <span
                  className={`text-white transition-transform duration-200 ${settingsOpen ? "rotate-90" : ""}`}
                  style={{ fontSize: 24 }}
                >
                  ▶
                </span>
              </div>
              <div
                className={`overflow-hidden rounded-b-xl bg-white/5 transition-all duration-300 ${settingsOpen ? "max-h-[1000px] px-6 py-4" : "max-h-0 px-6 py-0"}`}
                style={{}}
              >
                {settingsOpen && (
                  <>
                    <div className="mt-2 mb-4 flex items-center gap-4">
                      <button
                        onClick={() => isHost && handleModeChange("default")}
                        className={`rounded-l-lg px-4 py-2 font-bold ${mode === "default" ? "bg-yellow-400 text-black" : "bg-white/10 text-white"} ${!isHost ? "cursor-not-allowed opacity-60" : ""}`}
                        disabled={!isHost}
                      >
                        Default Songs Per Year
                      </button>
                      <button
                        onClick={() => isHost && handleModeChange("playlist")}
                        className={`rounded-r-lg px-4 py-2 font-bold ${mode === "playlist" ? "bg-yellow-400 text-black" : "bg-white/10 text-white"} ${!isHost ? "cursor-not-allowed opacity-60" : ""}`}
                        disabled={!isHost}
                      >
                        Choose Playlist(s)
                      </button>
                    </div>
                    <div className="mb-4 flex items-center gap-2">
                      <label htmlFor="rounds" className="text-white">
                        Number of Rounds:
                      </label>
                      <button
                        onClick={isHost ? startDecrement : undefined}
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 ${rounds <= 1 || !isHost ? "cursor-not-allowed opacity-50" : ""}`}
                        disabled={rounds <= 1 || !isHost}
                      >
                        -
                      </button>
                      <span className="min-w-[3rem] text-center text-2xl font-bold text-white">
                        {rounds}
                      </span>
                      <button
                        onClick={isHost ? startIncrement : undefined}
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 ${rounds >= 100 || !isHost ? "cursor-not-allowed opacity-50" : ""}`}
                        disabled={rounds >= 100 || !isHost}
                      >
                        +
                      </button>
                    </div>
                    {mode === "default" && (
                      <div className="mt-2 flex w-full flex-col items-center gap-2">
                        <div className="mb-1 text-white">Years:</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20">
                              {selectedYears.length > 0
                                ? selectedYears.join(", ")
                                : "Select Years"}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Select Years</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Array.from(
                              { length: new Date().getFullYear() - 2000 + 1 },
                              (_, i) => 2000 + i,
                            ).map((year) => (
                              <DropdownMenuCheckboxItem
                                key={year}
                                checked={selectedYears.includes(year)}
                                onCheckedChange={(checked) => {
                                  if (checked) handleAddYear(year);
                                  else handleDeleteYear(year);
                                }}
                              >
                                {year}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedYears.map((year) => (
                            <div
                              key={year}
                              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white"
                            >
                              <span>{year}</span>
                              <button
                                onClick={() => handleDeleteYear(year)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                                type="button"
                              >
                                ❌
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {mode === "playlist" && (
                      <div className="mt-2 flex w-full flex-col items-center gap-2">
                        <div className="mb-1 text-white">Playlists:</div>
                        {playlists.map((playlist, idx) => (
                          <div
                            key={idx}
                            className="flex w-full max-w-xs items-center gap-2"
                          >
                            <input
                              type="text"
                              value={playlist}
                              onChange={(e) =>
                                isHost &&
                                handlePlaylistChange(idx, e.target.value)
                              }
                              className="flex-1 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-white transition-all focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                              placeholder="Enter playlist URL or name"
                              disabled={!isHost}
                            />
                            <button
                              onClick={() => handleAddPlaylist()}
                              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-500 bg-transparent text-green-500 transition-all duration-150 hover:bg-green-500 hover:text-white focus:outline-none"
                              title="Add Playlist"
                              type="button"
                            >
                              <span className="text-xl font-bold">+</span>
                            </button>
                            {playlists.length > 1 && (
                              <button
                                onClick={() => handleRemovePlaylist(idx)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-transparent text-red-500 transition-all duration-150 hover:bg-red-500 hover:text-white focus:outline-none"
                                title="Remove Playlist"
                                type="button"
                              >
                                <span className="text-xl font-bold">×</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mb-8 space-y-2 rounded-xl bg-white/10 p-6 shadow-md">
            <h2 className="text-xl font-semibold text-white">
              Players in Lobby
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {players.map((player, index) => {
                const isSelf = player.toLowerCase() === name.toLowerCase();
                const isReady = readyPlayers.includes(player);
                return (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-center transition-all duration-200 ${
                      hoveredPlayer === player && isHost && !isSelf
                        ? "border-2 border-red-400 bg-red-500/20 line-through"
                        : ""
                    } ${isHost && !isSelf ? "hover:bg-red-500/10" : ""} ${
                      isReady
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
                      {player}
                      {isSelf ? " (You)" : ""}
                    </div>
                    <div className="mt-1 text-xs">
                      {isSelf ? (
                        isReady ? (
                          <span className="font-bold text-green-400">
                            (Ready)
                          </span>
                        ) : (
                          <div className="text-purple-400">
                            Hover and click to ready up
                          </div>
                        )
                      ) : isReady ? (
                        <span className="font-bold text-green-400">
                          (Ready)
                        </span>
                      ) : (
                        <span className="font-bold text-yellow-400">
                          (Not Ready)
                        </span>
                      )}
                    </div>
                    {isHost && !isSelf && (
                      <div className="mt-1 text-xs text-yellow-400">
                        Click to kick/ban
                      </div>
                    )}
                    {players[0]?.toLowerCase() === player.toLowerCase() && (
                      <div className="mt-1 text-xs text-yellow-400">Host</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom bar for ready/start/waiting */}
          <div className="pointer-events-none fixed bottom-0 left-0 flex w-full flex-col items-center pb-6">
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              {/* Host: Start Game */}
              <div className="flex flex-col items-center">
                {isHost && (
                  <Button
                    onClick={startGame}
                    disabled={
                      !isHost ||
                      !allReady ||
                      (mode === "default" && selectedYears.length === 0) ||
                      (mode === "playlist" &&
                        (!playlists.length ||
                          playlists.every((p) => !p.trim())))
                    }
                    className="mb-4 h-14 w-48 bg-yellow-500 text-xl font-bold text-black hover:bg-yellow-600 disabled:bg-yellow-300"
                  >
                    Start Game
                  </Button>
                )}
                {/* Non-host waiting message */}
                {!isHost && allReady && (
                  <div className="mb-4 text-center">
                    <div className="text-xl font-bold text-green-400">
                      Waiting for host to start the game...
                    </div>
                  </div>
                )}
                {((mode === "default" && selectedYears.length === 0) ||
                  (mode === "playlist" &&
                    (!playlists.length ||
                      playlists.every((p) => !p.trim())))) && (
                  <div className="mt-2 text-center text-sm text-yellow-200">
                    {mode === "default"
                      ? isHost
                        ? "You must select years in Game Settings"
                        : "Host must select years in Game Settings"
                      : isHost
                        ? "You must type in a playlist URL in Game Settings"
                        : "Host must type in a playlist URL in Game Settings"}
                  </div>
                )}
              </div>
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

      {showScore && gameMode === "single" && (
        <div className="fixed right-4 bottom-20 rounded-lg bg-black/80 p-4 text-white">
          <p className="text-xl font-bold">Score: {score}</p>
        </div>
      )}

      {gameMode === "multiplayer" && Object.keys(playerScores).length > 0 && (
        <div className="fixed right-4 bottom-20 rounded-lg bg-black/80 p-4 text-white">
          <p className="mb-2 text-lg font-bold">Player Scores:</p>
          {Object.entries(playerScores).map(([playerName, playerScore]) => (
            <div
              key={playerName}
              className="mb-1 flex items-center justify-between"
            >
              <span className="text-sm">{playerName}:</span>
              <span className="text-sm font-bold text-yellow-400">
                {playerScore}
              </span>
            </div>
          ))}
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
