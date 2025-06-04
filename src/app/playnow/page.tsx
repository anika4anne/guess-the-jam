"use client";

import React, { useState, useEffect } from "react";

interface Song {
  title: string;
  artist: string;
  // Add any other properties if you have more data
}

export default function PlayNowPage() {
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [errorIndexes, setErrorIndexes] = useState<number[]>([]);
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false);

  // NEW: countdown states
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);

  // NEW: fade state for countdown
  const [fadeCountdown, setFadeCountdown] = useState(false);

  const fetchTopSongs = async (years: number[]) => {
    try {
      const res = await fetch(`/api/getTopSongs?years=${years.join(",")}`);
      const data = (await res.json()) as Song[];
      setSongs(data);

      // Start countdown BEFORE showing Spotify player and songs
      setShowCountdown(true);
      setShowSpotifyPlayer(false);
      setCountdownNumber(3);
      setFadeCountdown(false); // reset fade on new fetch
    } catch (error) {
      console.error("Error fetching top songs:", error);
    }
  };

  // Handle countdown effect with fade out
  useEffect(() => {
    if (!showCountdown) return;

    if (countdownNumber === 0 && !fadeCountdown) {
      // Start fade out
      setFadeCountdown(true);
      return;
    }

    if (fadeCountdown) {
      // After fade duration hide countdown and show player
      const timeout = setTimeout(() => {
        setShowCountdown(false);
        setShowSpotifyPlayer(true);
        setFadeCountdown(false);
      }, 500); // fade duration

      return () => clearTimeout(timeout);
    }

    // Countdown decrement every second
    const timer = setTimeout(() => {
      setCountdownNumber((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownNumber, showCountdown, fadeCountdown]);

  // Rest of your handlers remain unchanged...

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

    if (name.trim() !== "") {
      setErrorIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const currentYear = new Date().getFullYear();
    const validYears = selectedYears.filter(
      (year) => year >= 2000 && year < currentYear,
    );

    const emptyIndexes = playerNames
      .map((name, i) => (name.trim() === "" ? i : -1))
      .filter((i) => i !== -1);

    setErrorIndexes(emptyIndexes);

    if (validYears.length > 0 && emptyIndexes.length === 0) {
      await fetchTopSongs(validYears);
    } else {
      alert("Please complete the form and select valid years.");
    }
  };

  if (songs) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-[linear-gradient(to_bottom,_black_0%,_#0a0000_15%,_#220000_35%,_#440000_60%,_#660000_100%)] px-6 pt-8 text-white">
        {/* Decorative Waves */}
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

        {/* Countdown Popup with fade */}
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

        {/* Show content only if countdown is NOT showing */}
        {!showCountdown && (
          <>
            <h1 className="mb-6 text-4xl font-bold">
              🎵 Let the Game Begin! 🎵
            </h1>
            <p className="mb-4">
              Now playing songs from: {selectedYears.join(", ")}
            </p>
            <ul className="max-w-xl list-inside list-disc">
              {songs.length > 0 &&
                songs.map((song, idx) => (
                  <li key={idx}>
                    {song.title} by {song.artist}
                  </li>
                ))}
            </ul>
            {/* Spotify Player if any selected year and after countdown */}
            {showSpotifyPlayer &&
              selectedYears.length > 0 &&
              selectedYears.map((year) => {
                const playlistLinks: Record<number, string> = {
                  2024: "https://open.spotify.com/embed/playlist/0NtZx6ZDoPupjxqGQ6yylo",
                  2023: "https://open.spotify.com/embed/playlist/6unJBM7ZGitZYFJKkO0e4P",
                  2022: "https://open.spotify.com/embed/playlist/56r5qRUv3jSxADdmBkhcz7",
                  2021: "https://open.spotify.com/embed/playlist/5GhQiRkGuqzpWZSE7OU4Se",
                  2020: "https://open.spotify.com/embed/playlist/2fmTTbBkXi8pewbUvG3CeZ",
                  2019: "https://open.spotify.com/embed/playlist/37i9dQZF1DWVRSukIED0e9",
                  2018: "https://open.spotify.com/embed/playlist/5l771HfZDqlBsDFQzO0431",
                  2017: "https://open.spotify.com/embed/playlist/4JbSoqC2zjkAFiaN8K4NYy",
                  2016: "https://open.spotify.com/embed/playlist/3JbWD8OGutoTKUbR3RvR8u",
                  2015: "https://open.spotify.com/embed/playlist/37i9dQZF1DX86diBZjYU2q",
                  2014: "https://open.spotify.com/embed/playlist/3Y0IIeAeLJMW2Okx4EQCkw",
                  2013: "https://open.spotify.com/embed/playlist/37i9dQZF1DX8cr9zdmLTqV",
                  2012: "https://open.spotify.com/embed/playlist/37i9dQZF1DX1lLhvjOZ9Eb",
                  2011: "https://open.spotify.com/embed/playlist/2z3eLip2NlV9quzTEm37cW",
                  2010: "https://open.spotify.com/embed/playlist/37i9dQZF1DWVN7yvDyMXUI",
                };

                const playlistURL = playlistLinks[year];
                if (!playlistURL) return null;

                return (
                  <iframe
                    key={year}
                    style={{ borderRadius: "12px", marginTop: "2rem" }}
                    src={playlistURL}
                    width="230"
                    height="160"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                );
              })}
          </>
        )}
      </main>
    );
  }

  // ... your initial page return remains unchanged

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] font-sans text-white">
      {/* Decorative Waves */}
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

        {/* Year Dropdown */}
        <div className="mt-6 flex w-full max-w-sm flex-col items-center">
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
                  <option
                    key={year}
                    value={year}
                    disabled={selectedYears.includes(year)}
                  >
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Year Tags */}
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
            {playerNames.map((name, index) => (
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
                  value={name}
                  onChange={(e) =>
                    handlePlayerNameChange(index, e.target.value)
                  }
                  className={`w-full rounded-lg px-4 py-2 text-white ${
                    errorIndexes.includes(index) ? "bg-red-600" : "bg-black"
                  }`}
                  placeholder={`Enter Player ${index + 1} Name`}
                />
              </div>
            ))}

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

      <footer className="mt-auto flex w-full items-center justify-end bg-transparent px-8 py-4 text-white">
        <div className="text-sm">
          <p>© Copyright 2025 Anika. All rights reserved.</p>
        </div>
      </footer>

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
