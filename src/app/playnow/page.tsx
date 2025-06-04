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
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);

  // Countdown states
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);

  // Fade state for countdown
  const [fadeCountdown, setFadeCountdown] = useState(false);

  const fetchTopSongs = async (years: number[]) => {
    try {
      const res = await fetch(`/api/getTopSongs?years=${years.join(",")}`);
      const data = (await res.json()) as Song[];
      setSongs(data);

      // Start countdown BEFORE showing YouTube player and songs
      setShowCountdown(true);
      setShowYouTubePlayer(false);
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
      setFadeCountdown(true);
      return;
    }

    if (fadeCountdown) {
      const timeout = setTimeout(() => {
        setShowCountdown(false);
        setShowYouTubePlayer(true);
        setFadeCountdown(false);
      }, 500); // fade duration

      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setCountdownNumber((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownNumber, showCountdown, fadeCountdown]);

  // Handlers (unchanged)
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
        {/* moving vines */}
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

        {/* countdown */}
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

        {/* if no countdown show song */}
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
            {/* now youtube */}
            {showYouTubePlayer &&
              selectedYears.length > 0 &&
              selectedYears.map((year) => {
                const playlistLinks: Record<number, string> = {
                  2024: "https://www.youtube.com/embed/videoseries?list=PLxA687tYuMWjS8IGRWkCzwTn10XcEccaZ&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2023: "https://www.youtube.com/embed/videoseries?list=PLdv33Q3_-41Hvf43VtcqsfQQOpWFd1_BF&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2022: "https://www.youtube.com/embed/videoseries?list=PLFI4VRJeIyw3fDbrTa_M864mYNXqZ6t7A&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2021: "https://www.youtube.com/embed/videoseries?list=PLuIAx5_9AFUiVwCbv4UN1V0vOJm4e-gwv&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2020: "https://www.youtube.com/embed/videoseries?list=PLaWhSPDmjQ4oBw1U0ak-TK_Pw4I9OGLsU&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2019: "https://www.youtube.com/embed/videoseries?list=PLZjyOXTKuD2Q_VN-XXHK-HVhQl58-ZI_H&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2018: "https://www.youtube.com/embed/videoseries?list=PLnBHN8ndXwY3ngcQxvrQ4CwH6VQcM0enM&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2017: "https://www.youtube.com/embed/videoseries?list=PLFU8AFaV2B6RfG_ZA6GadvT63ABBZtIKi&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2016: "https://www.youtube.com/embed/videoseries?list=PLAvHlMUITRMlUViWK1BWoawOUTZZIl4tG&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                  2015: "https://www.youtube.com/embed/videoseries?list=PLora6h23WG8UPaQDfC2_cpi4iVPI4Hp0y&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1",
                };

                const playlistURL = playlistLinks[year];
                if (!playlistURL) return null;

                return (
                  <iframe
                    key={year}
                    style={{
                      borderRadius: "12px",
                      marginTop: "2rem",
                      pointerEvents: "none", // disables mouse interaction
                    }}
                    src={playlistURL}
                    width="320"
                    height="180"
                    frameBorder="0"
                    allowFullScreen={false} // disables fullscreen button
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                );
              })}
          </>
        )}
      </main>
    );
  }

  // Initial page return remains unchanged
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] font-sans text-white">
      {/* vines */}
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

        {/* Year form */}
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

          {/* remove years */}
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

          {/* enter player name */}
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
