"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayNowPage() {
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([""]); // Default to one player
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const router = useRouter();

  const handleYearSelect = (year: number) => {
    if (!selectedYears.includes(year)) {
      setSelectedYears((prev) => [...prev, year].sort((a, b) => a - b));
    }
    setShowDropdown(false);
  };

  const handleDeleteYear = (year: number) => {
    setSelectedYears((prev) => prev.filter((item) => item !== year));
  };

  const handleAddPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames((prevNames) => [...prevNames, ""]);
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);
  };

  const handleSubmit = () => {
    const currentYear = new Date().getFullYear();
    const validYears = selectedYears.filter(
      (year) => year >= 2000 && year < currentYear,
    );

    if (
      validYears.length > 0 &&
      playerNames.every((name) => name.trim() !== "")
    ) {
      router.push(
        `/game?year=${validYears.join(",")}&players=${playerNames.length}&names=${playerNames.join(",")}`,
      );
    } else {
      alert("Please complete the form and select valid years.");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] font-sans text-white">
      {/* Left Wave Animation which doesn't work*/}
      <div className="animate-wave pointer-events-none absolute top-0 left-0 h-full w-24 opacity-20">
        <svg
          viewBox="0 0 100 600"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            className="wave-path"
            d="M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      </div>

      {/* Right Wave Animation doesn't work either */}
      <div className="animate-wave pointer-events-none absolute top-0 right-0 h-full w-24 scale-x-[-1] opacity-20">
        <svg
          viewBox="0 0 100 600"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            className="wave-path"
            d="M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      </div>

      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-[4rem]">
          Play Now
        </h1>
        <p className="max-w-2xl text-center text-xl text-white/80">
          What year(s) do you want the songs to be from? Choose a year between
          2000 and the current year.
        </p>

        <div className="mt-6 flex w-full max-w-sm flex-col items-center">
          {/* Year Selector */}
          <div className="relative w-full">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="w-full rounded-lg bg-black px-4 py-2 text-xl text-white"
            >
              {selectedYears.length === 0
                ? "Select a Year"
                : `${selectedYears.length} Year(s) Selected`}
            </button>

            {showDropdown && (
              <select
                onChange={(e) => handleYearSelect(parseInt(e.target.value))}
                className="absolute top-full left-0 mt-2 w-full rounded-lg bg-black px-4 py-2 text-white"
              >
                <option value="" disabled>
                  Select a Year
                </option>
                {Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, i) => 2000 + i,
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Years */}
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

          {/* Player Inputs */}
          <div className="mt-6 flex w-full max-w-sm flex-col items-center">
            {playerNames.map((_, index) => (
              <div key={index} className="mb-4 w-full">
                <label
                  htmlFor={`player-${index}`}
                  className="mb-2 block text-xl text-white"
                >
                  Player {index + 1} Name
                </label>
                <input
                  type="text"
                  id={`player-${index}`}
                  value={playerNames[index]}
                  onChange={(e) =>
                    handlePlayerNameChange(index, e.target.value)
                  }
                  className="w-full rounded-lg bg-black px-4 py-2 text-white"
                  placeholder={`Enter Player ${index + 1} Name`}
                />
              </div>
            ))}

            {/* Add Player Button with Bigger Pink Plus */}
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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="mt-6 rounded-full bg-yellow-400 px-6 py-2 text-lg text-white transition-all hover:bg-yellow-500"
          >
            Play
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto flex w-full items-center justify-end bg-transparent px-8 py-4 text-white">
        <div className="text-sm">
          <p>© Copyright 2025 Anika. All rights reserved.</p>
        </div>
      </footer>

      {/* Wave Animation  */}
      <style jsx>{`
        @keyframes wave {
          0% {
            d: path("M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600");
          }
          50% {
            d: path("M50 0 C30 100, 70 200, 50 300 C30 400, 70 500, 50 600");
          }
          100% {
            d: path("M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600");
          }
        }

        .wave-path {
          animation: wave 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
