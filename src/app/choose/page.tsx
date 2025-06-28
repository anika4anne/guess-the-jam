"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function ChoosePage() {
  const router = useRouter();
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [numberOfRounds, setNumberOfRounds] = useState(25);
  const [errorIndexes, setErrorIndexes] = useState<number[]>([]);
  const [duplicateNameError, setDuplicateNameError] = useState<string>("");
  const [decrementInterval, setDecrementInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [incrementInterval, setIncrementInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [fadeCountdown, setFadeCountdown] = useState(false);
  const [gameSettings, setGameSettings] = useState<{
    years: number[];
    players: string[];
    rounds: number;
  } | null>(null);

  const handleAddPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames((prevNames) => [...prevNames, ""]);
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);
    if (name.trim() !== "") {
      setErrorIndexes((prev) => prev.filter((i) => i !== index));
      const normalizedName = name.toLowerCase().trim();
      const duplicates = updatedNames
        .map((n, i) => ({ name: n, index: i }))
        .filter(
          (item, i) =>
            i !== index &&
            item.name.toLowerCase().trim() === normalizedName &&
            item.name.trim() !== "",
        );
      if (duplicates.length > 0) {
        setDuplicateNameError(`"${name}" is already taken!`);
      } else {
        setDuplicateNameError("");
      }
    } else {
      setDuplicateNameError("");
    }
  };

  const handleRemovePlayer = (index: number) => {
    setPlayerNames((prev) => prev.filter((_, i) => i !== index));
    setErrorIndexes((prev) => prev.filter((i) => i !== index));
  };

  const handleDeleteYear = (year: number) => {
    setSelectedYears((prev) => prev.filter((item) => item !== year));
  };

  const startDecrement = () => {
    if (numberOfRounds > 1) {
      setNumberOfRounds((prev) => Math.max(1, prev - 1));
      const interval = setInterval(() => {
        setNumberOfRounds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev - 1;
        });
      }, 100);
      setDecrementInterval(interval);
    }
  };

  const stopDecrement = () => {
    if (decrementInterval) {
      clearInterval(decrementInterval);
      setDecrementInterval(null);
    }
  };

  const startIncrement = () => {
    if (numberOfRounds < 100000) {
      setNumberOfRounds((prev) => Math.min(100000, prev + 1));
      const interval = setInterval(() => {
        setNumberOfRounds((prev) => {
          if (prev >= 100000) {
            clearInterval(interval);
            return 100000;
          }
          return prev + 1;
        });
      }, 100);
      setIncrementInterval(interval);
    }
  };

  const stopIncrement = () => {
    if (incrementInterval) {
      clearInterval(incrementInterval);
      setIncrementInterval(null);
    }
  };

  const handleSubmit = () => {
    const validPlayers = playerNames.filter((name) => name.trim() !== "");
    const currentYear = new Date().getFullYear();
    const validYears = selectedYears.filter(
      (year) => year >= 2000 && year <= currentYear,
    );
    if (validPlayers.length === 0 || validYears.length === 0) {
      alert("Please complete the form and select valid years.");
      return;
    }
    const normalizedNames = validPlayers.map((name) =>
      name.toLowerCase().trim(),
    );
    const uniqueNames = new Set(normalizedNames);
    if (uniqueNames.size !== normalizedNames.length) {
      alert("Please fix duplicate player names before starting the game.");
      return;
    }
    setGameSettings({
      years: validYears,
      players: validPlayers,
      rounds: numberOfRounds,
    });
    setShowCountdown(true);
    setCountdownNumber(3);
    setFadeCountdown(false);
  };

  useEffect(() => {
    if (!showCountdown) return;
    if (countdownNumber === 0 && !fadeCountdown) {
      setFadeCountdown(true);
      return;
    }
    if (fadeCountdown) {
      const timeout = setTimeout(() => {
        setShowCountdown(false);
        if (gameSettings) {
          const params = new URLSearchParams();
          params.set("years", gameSettings.years.join(","));
          params.set("players", gameSettings.players.join(","));
          params.set("rounds", gameSettings.rounds.toString());
          router.push(`/playnow?${params.toString()}`);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
    const timer = setTimeout(() => {
      setCountdownNumber((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdownNumber, showCountdown, fadeCountdown, gameSettings, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] font-sans text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-[4rem]">
          Play Now
        </h1>
        <p className="max-w-2xl text-center text-xl text-white/80">
          What year(s) do you want the songs to be from? Choose a year between
          2000 and the current year.
        </p>
        <div className="mt-6 flex w-full max-w-sm flex-col items-center">
          <div className="relative flex w-full justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="px-6 py-3 text-lg"
                  style={{ minWidth: "px", marginLeft: "5%" }}
                >
                  Choose A Year
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Years</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, i) => 2000 + i,
                ).map((year) => (
                  <DropdownMenuCheckboxItem
                    key={year}
                    checked={selectedYears.includes(year)}
                    onCheckedChange={() => {
                      if (selectedYears.includes(year)) {
                        setSelectedYears((prev) =>
                          prev.filter((y) => y !== year),
                        );
                      } else {
                        setSelectedYears((prev) => [...prev, year]);
                      }
                    }}
                  >
                    {year}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {selectedYears.map((year) => (
              <div
                key={year}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white"
              >
                <span>{year}</span>
                <button
                  onClick={() => handleDeleteYear(year)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex w-full max-w-sm flex-col items-center">
            <label htmlFor="rounds" className="mb-2 block text-xl text-white">
              Number of Rounds
            </label>
            <div className="flex items-center gap-4">
              <button
                onMouseDown={startDecrement}
                onMouseUp={stopDecrement}
                onMouseLeave={stopDecrement}
                onTouchStart={startDecrement}
                onTouchEnd={stopDecrement}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
                disabled={numberOfRounds <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={numberOfRounds}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= 100000) {
                    setNumberOfRounds(value);
                  }
                }}
                className="min-w-[4rem] border-none bg-transparent text-center text-2xl font-bold text-white outline-none"
                min="1"
                max="100000"
              />
              <button
                onMouseDown={startIncrement}
                onMouseUp={stopIncrement}
                onMouseLeave={stopIncrement}
                onTouchStart={startIncrement}
                onTouchEnd={stopIncrement}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
                disabled={numberOfRounds >= 100000}
              >
                +
              </button>
            </div>
            <p className="mt-2 text-sm text-white/60">
              Choose between 1-100,000 rounds
            </p>
          </div>
          <div className="mt-8 flex w-full max-w-sm flex-col items-center">
            {playerNames.map((name, index) => (
              <div key={index} className="mb-4 flex w-full items-center gap-2">
                <div className="flex-1">
                  <label
                    htmlFor={`player-${index}`}
                    className="mb-2 block text-xl text-white"
                  >
                    Player {index + 1} Name
                  </label>
                  <input
                    type="text"
                    id={`player-${index}`}
                    value={name}
                    onChange={(e) =>
                      handlePlayerNameChange(index, e.target.value)
                    }
                    className={`w-full rounded-lg px-4 py-2 text-white ${errorIndexes.includes(index) ? "bg-red-600" : "bg-black"}`}
                    placeholder={`Enter Player ${index + 1} Name`}
                  />
                </div>
                {playerNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(index)}
                    className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-2xl text-white transition hover:bg-red-700 focus:outline-none"
                    aria-label="Remove player"
                    style={{ boxShadow: "0 2px 8px #0002" }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "1.5rem",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </span>
                  </button>
                )}
              </div>
            ))}
            {duplicateNameError && (
              <div className="mb-4 w-full text-center font-semibold text-red-400">
                {duplicateNameError}
              </div>
            )}
            {playerNames.length < 6 && (
              <button
                onClick={handleAddPlayer}
                className="flex items-center rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20"
              >
                <span className="mr-2 -translate-y-[2px] transform text-3xl text-pink-500">
                  +
                </span>
                Add Player
              </button>
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="mt-6 rounded-full bg-yellow-400 px-6 py-2 text-lg text-white transition-all hover:bg-yellow-500"
          >
            Play
          </button>
        </div>
      </div>
      {/* Countdown overlay */}
      {showCountdown && (
        <div
          className="bg-opacity-90 fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-6xl font-bold tracking-widest text-white transition-opacity duration-500"
          style={{ opacity: fadeCountdown ? 0 : 1 }}
        >
          <p>ARE YOU READY?</p>
          <p className="mt-6">
            {countdownNumber > 0 ? countdownNumber : "GO!"}
          </p>
        </div>
      )}
    </main>
  );
}
