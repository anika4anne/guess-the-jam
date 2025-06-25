"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Confetti from "react-confetti";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface Song {
  title: string;
  artist: string;
}

interface YouTubePlayer extends YT.Player {
  __intervalAttached?: boolean;
}
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function PlayNowPage() {
  const router = useRouter();
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [errorIndexes, setErrorIndexes] = useState<number[]>([]);
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);
  const [volumeUnmuted, setVolumeUnmuted] = useState(false);

  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);

  const [fadeCountdown, setFadeCountdown] = useState(false);
  const iframeRefs = useRef<Record<number, HTMLIFrameElement | null>>({});

  const [currentQuestionYear, setCurrentQuestionYear] = useState<number | null>(
    null,
  );
  const [showPrompt, setShowPrompt] = useState(false);
  const [userSongAnswer, setUserSongAnswer] = useState("");
  const [userArtistAnswer, setUserArtistAnswer] = useState("");
  const [currentSong, setCurrentSong] = useState("");
  const [currentArtist, setCurrentArtist] = useState("");
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [playerAnswers, setPlayerAnswers] = useState<
    Record<
      string,
      {
        song: string;
        artist: string;
        points: number;
        songCorrect: boolean;
        artistCorrect: boolean;
        songRaw?: string;
        artistRaw?: string;
      }
    >
  >({});
  const [showAllResults, setShowAllResults] = useState(false);
  const [gameMode, setGameMode] = useState<"single" | "multiplayer">("single");

  const playerRefs = useRef<Record<number, YouTubePlayer | null>>({});

  const intervalRefs = useRef<Record<number, NodeJS.Timeout | null>>({});
  const [index] = useState(Math.floor(Math.random() * 80));

  const [visualizerTime, setVisualizerTime] = useState(0);
  const visualizerPhases = useRef(
    Array.from({ length: 48 }, () => Math.random() * Math.PI * 2),
  );

  const [showArtist, setShowArtist] = useState(false);
  const [showSong, setShowSong] = useState(false);
  const [inputError, setInputError] = useState("");

  const [round, setRound] = useState(1);
  const [hasStartedFirstQuestion, setHasStartedFirstQuestion] = useState(false);

  const [duplicateNameError, setDuplicateNameError] = useState<string>("");

  const [showVolumeReminder, setShowVolumeReminder] = useState(true);

  const [numberOfRounds, setNumberOfRounds] = useState(25);

  const [gameFinished, setGameFinished] = useState(false);

  const [decrementInterval, setDecrementInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [incrementInterval, setIncrementInterval] =
    useState<NodeJS.Timeout | null>(null);

  const fetchTopSongs = async (years: number[]) => {
    try {
      const res = await fetch(`/api/getTopSongs?years=${years.join(",")}`);
      const data = (await res.json()) as Song[];
      setSongs(data);
      const validPlayers = playerNames.filter((name) => name.trim() !== "");
      const isMultiplayer = validPlayers.length > 1;
      setGameMode(isMultiplayer ? "multiplayer" : "single");
      if (isMultiplayer) {
        const initialScores: Record<string, number> = {};
        validPlayers.forEach((player) => {
          initialScores[player] = 0;
        });
        setPlayerScores(initialScores);
        setCurrentPlayerIndex(0);
      }
      setShowCountdown(true);
      setShowYouTubePlayer(false);
      setCountdownNumber(3);
      setFadeCountdown(false);
      setGameFinished(false);
    } catch (error) {
      console.error("Error fetching top songs:", error);
    }
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
        setShowYouTubePlayer(true);
        setFadeCountdown(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
    const timer = setTimeout(() => {
      setCountdownNumber((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdownNumber, showCountdown, fadeCountdown]);

  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API is ready");
    };
  }, []);

  useEffect(() => {
    if (!window.YT || !showYouTubePlayer) return;
    const currentIntervalRefs = { ...intervalRefs.current };
    selectedYears.forEach((year) => {
      const iframe = iframeRefs.current[year];
      if (!iframe) return;
      playerRefs.current[year] = new window.YT.Player(iframe, {
        height: "0",
        width: "0",
        events: {
          onReady: () => {
            console.log(`YouTube Player for year ${year} is ready`);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            const player = playerRefs.current[year];
            if (!player) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              const videoData = player.getVideoData();
              if (videoData) {
                const { artist, song } = extractArtistAndSong(
                  videoData.title ?? "",
                  videoData.author ?? "",
                );
                setCurrentSong(song);
                setCurrentArtist(artist);
              }
              if (currentIntervalRefs[year]) {
                const interval = currentIntervalRefs[year];
                if (interval) {
                  clearInterval(interval);
                }
                currentIntervalRefs[year] = null;
                console.log(`Cleared previous interval for year ${year}`);
              }
              currentIntervalRefs[year] = setInterval(() => {
                const currentTime = player.getCurrentTime();
                console.log(`Year ${year} currentTime:`, currentTime);
                if (currentTime >= 15) {
                  player.pauseVideo();
                  const interval = currentIntervalRefs[year];
                  if (interval) {
                    clearInterval(interval);
                  }
                  currentIntervalRefs[year] = null;
                  setCurrentQuestionYear(year);
                  setShowPrompt(true);
                  console.log(`Paused video for year ${year} at 15 seconds`);
                }
              }, 500);
              console.log(`Set up interval for year ${year}`);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              if (currentIntervalRefs[year]) {
                const interval = currentIntervalRefs[year];
                if (interval) {
                  clearInterval(interval);
                }
                currentIntervalRefs[year] = null;
              }
            }
          },
        },
      });
    });
    intervalRefs.current = currentIntervalRefs;
    return () => {
      Object.entries(currentIntervalRefs).forEach(([year, intervalId]) => {
        if (intervalId) {
          clearInterval(intervalId);
          console.log(`Cleanup: Cleared interval for year ${year}`);
        }
      });
    };
  }, [showYouTubePlayer, selectedYears]);

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

  const handleSubmit = async () => {
    const currentYear = new Date().getFullYear();
    const validYears = selectedYears.filter(
      (year) => year >= 2000 && year < currentYear,
    );

    const validPlayers = playerNames.filter((name) => name.trim() !== "");
    if (validPlayers.length === 0) {
      alert("Please enter at least one player name.");
      return;
    }

    if (playerNames.some((name) => name.trim() === "")) {
      alert("Please fill in all player names or remove empty players.");
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

    const emptyIndexes = playerNames
      .map((name, i) => (name.trim() === "" ? i : -1))
      .filter((i) => i !== -1);

    setErrorIndexes(emptyIndexes);

    if (validYears.length > 0 && validPlayers.length > 0) {
      await fetchTopSongs(validYears);
    } else {
      alert("Please complete the form and select valid years.");
    }
  };

  function normalize(str: string) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(
        /\(.*?\)|\[.*?\]|official|video|audio|lyrics|ft\.?|feat\.?|"|'|-|_|:|\s+/g,
        " ",
      )
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractSongName(title: string) {
    let shortTitle = title.replace(/\(.*?\)|\[.*?\]/g, "");
    shortTitle = shortTitle.replace(
      /official|video|audio|lyrics|ft\.?|feat\.?/gi,
      "",
    );

    const dashIndex = shortTitle.indexOf("-");
    if (dashIndex !== -1) {
      shortTitle = shortTitle.slice(dashIndex + 1);
    }
    return shortTitle.trim();
  }

  function extractArtistAndSong(title: string, author: string) {
    const dashIndex = title.indexOf(" - ");
    if (dashIndex !== -1) {
      const artist = title.slice(0, dashIndex).trim();
      const song = title.slice(dashIndex + 3).trim();
      return { artist, song };
    }

    return { artist: author, song: title };
  }

  function isArtistCorrect(userArtist: string, correctArtist: string) {
    const normalizedUser = normalize(userArtist);
    const userWords = normalizedUser.split(" ").filter((w) => w.length > 2);
    const correctArtists = correctArtist
      .split(/,|&|feat\.|ft\.|and/gi)
      .map((a) => normalize(a.trim()))
      .filter(Boolean);
    const correctWords = correctArtists.flatMap((a) =>
      a.split(" ").filter((w) => w.length > 2),
    );
    return userWords.some((uw) => correctWords.includes(uw));
  }

  const encouragements = useMemo(
    () => [
      "Great job!",
      "You're doing amazing!",
      "Keep it up!",
      "Fantastic!",
      "You've got this!",
      "Incredible!",
      "Outstanding!",
      "Brilliant!",
      "Excellent!",
      "Superb!",
    ],
    [],
  );
  const [currentEncouragement, setCurrentEncouragement] = useState<string>(
    encouragements[0]!,
  );
  useEffect(() => {
    if (score > 0) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * encouragements.length);
        setCurrentEncouragement(encouragements[randomIndex]!);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [score, encouragements]);

  function isSongCorrect(userSong: string, correctSong: string) {
    const normalizedUser = normalize(userSong);
    const normalizedCorrect = normalize(correctSong);
    const correctWords = normalizedCorrect
      .split(" ")
      .filter((w) => w.length > 2);
    return correctWords.some((word) => normalizedUser.includes(word));
  }

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setVisualizerTime(performance.now());
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  function getUnmaskedAnswer(masked: string, original: string) {
    if (masked.includes("•")) return original;
    return masked;
  }

  useEffect(() => {
    return () => {
      const currentPlayerRefs = { ...playerRefs.current };
      Object.values(currentPlayerRefs).forEach((player) => {
        if (player && typeof player.destroy === "function") {
          player.destroy();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (showPrompt) {
      setShowArtist(false);
      setShowSong(false);
    }
  }, [showPrompt]);

  if (songs) {
    const normalizedUserSong = normalize(userSongAnswer);
    const normalizedCorrectSong = normalize(currentSong);
    const normalizedUserArtist = normalize(userArtistAnswer);
    const normalizedCorrectArtist = normalize(currentArtist);

    const songCorrect = isSongCorrect(
      normalizedUserSong,
      normalizedCorrectSong,
    );
    const artistCorrect = isArtistCorrect(
      normalizedUserArtist,
      normalizedCorrectArtist,
    );

    return (
      <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-[linear-gradient(to_bottom,_black_0%,_#0a0000_15%,_#220000_35%,_#440000_60%,_#660000_100%)] px-6 pt-8 text-white">
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

        {gameFinished && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={350}
              recycle={false}
            />
            <div className="text-center">
              <h1 className="mb-8 text-6xl font-bold text-yellow-400">
                🎉 Game Complete! 🎉
              </h1>
              <p className="mb-8 text-2xl">
                {round >= numberOfRounds
                  ? `You've finished all ${numberOfRounds} rounds!!!!!!!`
                  : `Game ended after ${round} round${round !== 1 ? "s" : ""}`}
              </p>
              {gameMode === "multiplayer" && (
                <div className="mb-8">
                  <h2 className="mb-4 text-3xl font-bold text-white">
                    Final Leaderboard
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(playerScores)
                      .sort(([, a], [, b]) => b - a)
                      .map(([playerName, score], index) => (
                        <div
                          key={playerName}
                          className="flex items-center justify-between rounded-lg bg-white/10 px-6 py-3"
                        >
                          <span className="flex items-center gap-2 text-xl">
                            <span className="font-bold">
                              {index === 0 && <span className="mr-1">🏆</span>}
                              {index === 0
                                ? "1st"
                                : index === 1
                                  ? "2nd"
                                  : index === 2
                                    ? "3rd"
                                    : `${index + 1}th`}
                            </span>
                            {playerName}
                          </span>
                          <span className="text-2xl font-bold text-yellow-400">
                            {score} pts
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {gameMode === "single" && (
                <div className="mb-8">
                  <h2 className="mb-4 text-3xl font-bold text-white">
                    Final Score
                  </h2>
                  <p className="text-4xl font-bold text-yellow-400">
                    {score} points
                  </p>
                </div>
              )}
              <div className="space-x-4">
                <Button
                  onClick={() => {
                    setSongs(null);
                    setGameFinished(false);
                    setRound(1);
                    setHasStartedFirstQuestion(false);
                    setScore(0);
                    setPlayerScores({});
                    setPlayerAnswers({});
                    setCurrentPlayerIndex(0);
                    setShowPrompt(false);
                    setShowAllResults(false);
                    setShowYouTubePlayer(false);
                    setShowCountdown(false);
                    setUserSongAnswer("");
                    setUserArtistAnswer("");
                    setCurrentSong("");
                    setCurrentArtist("");
                    setShowScore(false);
                    setShowResult(false);
                    setPointsEarned(null);
                    setShowArtist(false);
                    setShowSong(false);
                    setInputError("");
                    setDuplicateNameError("");
                    setShowVolumeReminder(true);
                    setCurrentQuestionYear(null);
                    setVisualizerTime(0);
                    setVolumeUnmuted(false);
                  }}
                  className="bg-yellow-400 px-8 py-4 text-lg font-bold text-black hover:bg-yellow-500"
                >
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-white/20 bg-white/10 px-8 py-4 text-lg text-white hover:bg-white/20"
                >
                  Back to Menu
                </Button>
              </div>
            </div>
          </div>
        )}

        {!showCountdown && !gameFinished && (
          <>
            <div className="relative mb-6 flex w-full items-center justify-center">
              <h1 className="w-full text-center text-4xl font-bold">
                🎵 Let the Game Begin! 🎵
              </h1>
              <div className="absolute top-1/2 right-0 flex -translate-y-1/2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setGameFinished(true)}
                  className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  End Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Exit
                </Button>
              </div>
            </div>
            <p className="mb-4">
              Now playing songs from: {selectedYears.join(", ")}
            </p>
            {showVolumeReminder && (
              <div className="mb-4 font-bold text-green-400">
                Don&apos;t forget to press Volume Up
              </div>
            )}
            <ul className="max-w-xl list-inside list-disc">
              {songs.length > 0 &&
                songs.map((song, idx) => (
                  <li key={idx}>
                    {song.title} by {song.artist}
                  </li>
                ))}
            </ul>
            {showYouTubePlayer &&
              selectedYears.length > 0 &&
              selectedYears.map((year) => {
                const playlistLinks: Record<number, string> = {
                  2024: "https://www.youtube.com/embed/videoseries?list=PLxA687tYuMWjS8IGRWkCzwTn10XcEccaZ&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2023: "https://www.youtube.com/embed/videoseries?list=PLdv33Q3_-41Hvf43VtcqsfQQOpWFd1_BF&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2022: "https://www.youtube.com/embed/videoseries?list=PLFI4VRJeIyw3fDbrTa_M864mYNXqZ6t7A&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2021: "https://www.youtube.com/embed/videoseries?list=PLuIAx5_9AFUiVwCbv4UN1V0vOJm4e-gwv&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2020: "https://www.youtube.com/embed/videoseries?list=PLaWhSPDmjQ4oBw1U0ak-TK_Pw4I9OGLsU&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2019: "https://www.youtube.com/embed/videoseries?list=PLZjyOXTKuD2Q_VN-XXHK-HVhQl58-ZI_H&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2018: "https://www.youtube.com/embed/videoseries?list=PLnBHN8ndXwY3ngcQxvrQ4CwH6VQcM0enM&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2017: "https://www.youtube.com/embed/videoseries?list=PLFU8AFaV2B6RfG_ZA6GadvT63ABBZtIKi&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2016: "https://www.youtube.com/embed/videoseries?list=PLAvHlMUITRMlUViWK1BWoawOUTZZIl4tG&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2015: "https://www.youtube.com/embed/videoseries?list=PLora6h23WG8UPaQDfC2_cpi4iVPI4Hp0y&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2014: "https://www.youtube.com/embed/videoseries?list=PLCbZNiNDUZtp2pM_BbnRtlc2Y7cyMNVkL&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2013: "https://www.youtube.com/embed/videoseries?list=PLw_s-_bg5n2VuukP3aSQik31jBJ5ICXFq&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2012: "https://www.youtube.com/embed/videoseries?list=PLem9vLZEVqmZ5H67lelbDER05kG8FcF-u&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2011: "https://www.youtube.com/embed/videoseries?list=PL-CYomtw4SPG6XkvXw6AahcSOWTg0PfyA&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2010: "https://www.youtube.com/embed/videoseries?list=PL5579B759A885680C&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2009: "https://www.youtube.com/embed/videoseries?list=PLsdPA0A_fKLlMWIyLdp3d2FrN7t1hiXUE&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2008: "https://www.youtube.com/embed/videoseries?list=PLam08HY53ekvPojGF4hzhAdNE609JCUHo&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2007: "https://www.youtube.com/embed/videoseries?list=PL8629BA4D2BFD141B&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2006: "https://www.youtube.com/embed/videoseries?list=PLCbZNiNDUZtqxO0cnTTqrjUHGdI0AbzyD&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2005: "https://www.youtube.com/embed/videoseries?list=PLqKA0FE2hsOnF7gc5jg6R-aoBerQ8Y5ea&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2004: "https://www.youtube.com/embed/videoseries?list=PLYosk6VjN4ib0lNXBwNVGZ1xjakmuLdnk&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2003: "https://www.youtube.com/embed/videoseries?list=PLqKA0FE2hsOmI1alHexOnn5H6VS948QDd&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2002: "https://www.youtube.com/embed/videoseries?list=PLsdPA0A_fKLmeOQ8SA8toBhiVA_3YY54R&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2001: "https://www.youtube.com/embed/videoseries?list=PLYosk6VjN4iaqktGTn_7iJvJIku6Z5XgG&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2000: "https://www.youtube.com/embed/videoseries?list=PLFczJQWL3c0hvajZ3MyNFzUO3QURpY7N0&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                };

                const playlistURL = playlistLinks[year];
                if (!playlistURL) return null;

                const showVisualizer = showYouTubePlayer;
                return (
                  <div
                    key={year}
                    className="relative mx-auto w-fit"
                    style={{ zIndex: 0 }}
                  >
                    <div
                      style={{
                        width: "1100px",
                        height: "600px",
                        overflow: "hidden",
                        borderRadius: "12px",
                        position: "relative",
                        marginTop: "2rem",
                      }}
                    >
                      <iframe
                        ref={(el) => {
                          iframeRefs.current[year] = el;
                        }}
                        id={`youtube-player-${year}`}
                        src={`${playlistURL}&enablejsapi=1&index=${index}`}
                        width="640"
                        height="390"
                        frameBorder="0"
                        allowFullScreen={false}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        style={{
                          borderRadius: "12px",
                          marginTop: "-30px",
                          pointerEvents: "none",
                          zIndex: 1,
                          position: "relative",
                        }}
                        loading="lazy"
                      />
                      {showVisualizer && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 9999,
                            pointerEvents: "none",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              width: "100%",
                              height: "100%",
                              background: "black",
                              opacity: 1,
                              zIndex: 1,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              width: 320,
                              height: 320,
                              transform: "translate(-50%, -50%)",
                              pointerEvents: "none",
                              zIndex: 2,
                            }}
                          >
                            <svg
                              width="320"
                              height="320"
                              style={{ position: "absolute", left: 0, top: 0 }}
                            >
                              {Array.from({ length: 48 }).map((_, i) => {
                                const center = 160;
                                const r0 = 100;
                                const phase = visualizerPhases.current
                                  ? visualizerPhases.current[i]
                                  : 0;
                                const t =
                                  visualizerTime / 600 +
                                  i * 0.18 +
                                  (phase ?? 0);
                                const len = 24 + 36 * Math.abs(Math.sin(t));
                                const angle = i * 7.5;
                                const rad = (angle * Math.PI) / 180;
                                const x0 = center + r0 * Math.cos(rad);
                                const y0 = center + r0 * Math.sin(rad);
                                const x1 = center + (r0 + len) * Math.cos(rad);
                                const y1 = center + (r0 + len) * Math.sin(rad);
                                const color = `hsl(${angle}, 90%, 60%)`;
                                return (
                                  <line
                                    key={i}
                                    x1={x0}
                                    y1={y0}
                                    x2={x1}
                                    y2={y1}
                                    stroke={color}
                                    strokeWidth={5}
                                    strokeLinecap="round"
                                    style={{
                                      filter: `drop-shadow(0 0 6px ${color})`,
                                    }}
                                  />
                                );
                              })}
                            </svg>
                            <div
                              style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: 200,
                                height: 200,
                                transform: "translate(-50%, -50%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                              }}
                            >
                              <Image
                                src="/Guess-The-Jam-Logo.png"
                                alt="Guess the Jam Logo"
                                width={200}
                                height={200}
                                style={{
                                  borderRadius: "50%",
                                  boxShadow: "0 0 32px 8px #0008",
                                  zIndex: 2,
                                  position: "relative",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            {!volumeUnmuted && (
              <div className="mt-8 mb-4 flex justify-center">
                <button
                  onClick={() => {
                    try {
                      Object.values(playerRefs.current).forEach((player) => {
                        if (player && typeof player.unMute === "function") {
                          player.unMute();
                        }
                      });
                      setVolumeUnmuted(true);
                      setShowVolumeReminder(false);
                    } catch (err) {
                      console.error("Unmute failed:", err);
                    }
                  }}
                  className="rounded-full bg-green-500 px-6 py-2 text-lg text-white transition-all hover:bg-green-600"
                >
                  ▶️ Volume Up
                </button>
              </div>
            )}

            {showPrompt && (
              <div className="prompt-z fixed inset-0 z-[10001] flex items-center justify-center bg-black/80">
                <div className="relative w-full max-w-md rounded-lg bg-[#1e1b4d] p-6 text-white">
                  <h2 className="mb-2 text-2xl font-bold">Guess the Song!</h2>
                  <p className="mb-4">Year: {currentQuestionYear}</p>

                  {inputError && (
                    <div className="mb-2 text-center font-semibold text-red-400">
                      {inputError}
                    </div>
                  )}

                  {gameMode === "multiplayer" && (
                    <div className="mb-4 text-center">
                      <p className="text-lg font-semibold text-yellow-400">
                        {playerNames[currentPlayerIndex]}&apos;s Turn
                      </p>
                      <p className="text-sm text-gray-300">
                        Player {currentPlayerIndex + 1} of{" "}
                        {
                          playerNames.filter((name) => name.trim() !== "")
                            .length
                        }
                      </p>
                    </div>
                  )}

                  {pointsEarned !== null &&
                    showResult &&
                    gameMode === "single" && (
                      <div className="mb-6 w-full text-center text-lg font-bold">
                        {(() => {
                          const anyWrong = !songCorrect || !artistCorrect;
                          const bothWrong = !songCorrect && !artistCorrect;
                          return (
                            <>
                              <span className="mt-6 block text-yellow-400">
                                Your guess:{" "}
                                <span
                                  className={
                                    songCorrect
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  {userSongAnswer ?? "(no guess)"}
                                </span>
                                {" - "}
                                <span
                                  className={
                                    artistCorrect
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  {userArtistAnswer ?? "(no guess)"}
                                </span>
                                {bothWrong && (
                                  <span className="text-red-500"> ❌</span>
                                )}
                                {!anyWrong && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      verticalAlign: "middle",
                                      marginLeft: 4,
                                    }}
                                  >
                                    <svg
                                      width="22"
                                      height="22"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M5 13l4 4L19 7"
                                        stroke="#22c55e"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </span>
                              {anyWrong ? (
                                <div className="mt-2">
                                  <span className="text-yellow-400">Ans:</span>{" "}
                                  <span className="text-white">
                                    {extractSongName(currentSong) ?? "-"} -{" "}
                                    {currentArtist ?? "-"}
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-6 text-white">
                                  {currentEncouragement}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                  {showAllResults && gameMode === "multiplayer" && (
                    <div className="mb-6 w-full text-center text-lg font-bold">
                      <h3 className="mb-4 text-xl font-bold text-yellow-400">
                        Round Results
                      </h3>
                      {Object.entries(playerAnswers).map(
                        ([playerName, answer]) => {
                          const bothWrong =
                            !answer.songCorrect && !answer.artistCorrect;
                          const bothRight =
                            answer.songCorrect && answer.artistCorrect;
                          return (
                            <div
                              key={playerName}
                              className={`mb-3 rounded-lg p-3 ${bothWrong ? "bg-red-400/20" : bothRight ? "bg-green-700/80" : "bg-white/10"}`}
                            >
                              <p className="font-semibold text-blue-400">
                                {playerName}
                              </p>
                              <p className="text-sm">
                                Song:{" "}
                                <span
                                  className={
                                    answer.songCorrect
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  {getUnmaskedAnswer(
                                    answer.song,
                                    answer.songRaw ?? answer.song,
                                  ) ?? "(no guess)"}
                                </span>
                              </p>
                              <p className="text-sm">
                                Artist:{" "}
                                <span
                                  className={
                                    answer.artistCorrect
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  {getUnmaskedAnswer(
                                    answer.artist,
                                    answer.artistRaw ?? answer.artist,
                                  ) ?? "(no guess)"}
                                </span>
                              </p>
                              <p className="text-sm font-bold">
                                Points:{" "}
                                <span className="text-yellow-400">
                                  {answer.points}
                                </span>
                              </p>
                            </div>
                          );
                        },
                      )}
                      <div className="mt-4 rounded-lg bg-yellow-500/20 p-3">
                        <p className="font-bold text-yellow-400">
                          Correct Answer:
                        </p>
                        <p className="text-white">
                          {extractSongName(currentSong) ?? "-"} -{" "}
                          {currentArtist ?? "-"}
                        </p>
                      </div>
                    </div>
                  )}

                  {!showResult && !showAllResults && (
                    <>
                      <div className="relative mb-4">
                        <label htmlFor="artist" className="mb-2 block">
                          Artist Name:
                        </label>
                        <input
                          type={
                            gameMode === "multiplayer" && !showArtist
                              ? "password"
                              : "text"
                          }
                          id="artist"
                          value={userArtistAnswer}
                          onChange={(e) => setUserArtistAnswer(e.target.value)}
                          className="w-full rounded bg-black/50 p-2 pr-12 font-mono text-white"
                          placeholder="Enter artist name"
                          autoComplete="off"
                          style={{ letterSpacing: "0.1em" }}
                        />
                        {gameMode === "multiplayer" && (
                          <button
                            type="button"
                            onClick={() => setShowArtist((v) => !v)}
                            className="absolute right-3 bottom-2 flex items-center text-2xl text-gray-300 hover:text-white focus:outline-none"
                            tabIndex={-1}
                            aria-label={
                              showArtist ? "Hide artist" : "Show artist"
                            }
                            style={{ padding: 0 }}
                          >
                            {showArtist ? "🙈" : "👁️"}
                          </button>
                        )}
                      </div>
                      <div className="relative mb-6">
                        <label htmlFor="song" className="mb-2 block">
                          Song Title:
                        </label>
                        <input
                          type={
                            gameMode === "multiplayer" && !showSong
                              ? "password"
                              : "text"
                          }
                          id="song"
                          value={userSongAnswer}
                          onChange={(e) => setUserSongAnswer(e.target.value)}
                          className="w-full rounded bg-black/50 p-2 pr-12 font-mono text-white"
                          placeholder="Enter song title"
                          autoComplete="off"
                          style={{ letterSpacing: "0.1em" }}
                        />
                        {gameMode === "multiplayer" && (
                          <button
                            type="button"
                            onClick={() => setShowSong((v) => !v)}
                            className="absolute right-3 bottom-2 flex items-center text-2xl text-gray-300 hover:text-white focus:outline-none"
                            tabIndex={-1}
                            aria-label={showSong ? "Hide song" : "Show song"}
                            style={{ padding: 0 }}
                          >
                            {showSong ? "🙈" : "👁️"}
                          </button>
                        )}
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => {
                            if (
                              !userArtistAnswer.trim() &&
                              !userSongAnswer.trim()
                            ) {
                              setInputError("You have to guess at least one!");
                              return;
                            } else {
                              setInputError("");
                            }

                            let points = 0;
                            const artistCorrect = isArtistCorrect(
                              userArtistAnswer,
                              currentArtist,
                            );
                            const songCorrect = isSongCorrect(
                              userSongAnswer,
                              currentSong,
                            );
                            if (artistCorrect) {
                              points += 5;
                            }
                            if (songCorrect) {
                              points += 5;
                            }

                            if (gameMode === "single") {
                              setPointsEarned(points);
                              setShowResult(true);
                              if (points > 0) {
                                setScore((prev) => prev + points);
                                setShowScore(true);
                              }
                            } else {
                              const currentPlayerName =
                                playerNames[currentPlayerIndex];
                              if (
                                currentPlayerName &&
                                currentPlayerName.trim() !== ""
                              ) {
                                const newAnswers = { ...playerAnswers };
                                const realSongAnswer = userSongAnswer;
                                const realArtistAnswer = userArtistAnswer;
                                newAnswers[currentPlayerName] = {
                                  song: realSongAnswer,
                                  songRaw: realSongAnswer,
                                  artist: realArtistAnswer,
                                  artistRaw: realArtistAnswer,
                                  points,
                                  songCorrect,
                                  artistCorrect,
                                };
                                setPlayerAnswers(newAnswers);

                                setPlayerScores((prev) => ({
                                  ...prev,
                                  [currentPlayerName]:
                                    (prev[currentPlayerName] ?? 0) + points,
                                }));

                                const validPlayers = playerNames.filter(
                                  (name) => name.trim() !== "",
                                );
                                if (
                                  currentPlayerIndex <
                                  validPlayers.length - 1
                                ) {
                                  setCurrentPlayerIndex(currentPlayerIndex + 1);
                                  setUserSongAnswer("");
                                  setUserArtistAnswer("");
                                } else {
                                  setShowAllResults(true);
                                }
                              }
                            }
                          }}
                          className="rounded bg-yellow-400 px-6 py-2 font-bold text-black hover:bg-yellow-500"
                        >
                          {gameMode === "multiplayer"
                            ? "Submit & Next"
                            : "Submit"}
                        </button>
                      </div>
                    </>
                  )}

                  {showResult && gameMode === "single" && (
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => {
                          if (round + 1 > numberOfRounds) {
                            setGameFinished(true);
                          } else {
                            setRound(round + 1);
                            setUserArtistAnswer("");
                            setUserSongAnswer("");
                            setShowPrompt(false);
                            setShowResult(false);
                            setPointsEarned(null);
                            const player =
                              playerRefs.current[currentQuestionYear!];
                            if (player) {
                              player.nextVideo();
                              player.playVideo();
                            }
                          }
                        }}
                        className="rounded bg-blue-500 px-6 py-2 font-bold text-white hover:bg-blue-600"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {showAllResults && gameMode === "multiplayer" && (
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => {
                          if (round + 1 > numberOfRounds) {
                            setGameFinished(true);
                          } else {
                            setRound(round + 1);
                            setUserArtistAnswer("");
                            setUserSongAnswer("");
                            setShowPrompt(false);
                            setShowAllResults(false);
                            setPlayerAnswers({});
                            setCurrentPlayerIndex(0);
                            const player =
                              playerRefs.current[currentQuestionYear!];
                            if (player) {
                              player.nextVideo();
                              player.playVideo();
                            }
                          }
                        }}
                        className="rounded bg-yellow-400 px-6 py-2 font-bold text-black hover:bg-yellow-500"
                      >
                        Next Song
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showScore && gameMode === "single" && (
              <div className="fixed right-4 bottom-4 rounded-lg bg-black/80 p-4 text-white">
                <p className="text-xl font-bold">Score: {score}</p>
              </div>
            )}

            {gameMode === "multiplayer" &&
              playerNames.filter((name) => name.trim() !== "").length > 0 && (
                <div className="mt-8 flex w-full flex-col items-center">
                  <div className="mb-2 text-center text-lg font-bold text-white">
                    Round {round} of {numberOfRounds}
                  </div>
                  <div className="mx-auto flex w-fit max-w-full flex-row items-center justify-center gap-6 rounded-full bg-black/80 px-8 py-3 text-white shadow-lg">
                    {playerNames
                      .filter((name) => name.trim() !== "")
                      .sort(
                        (a, b) =>
                          (playerScores[b] ?? 0) - (playerScores[a] ?? 0),
                      )
                      .map((playerName, idx) => (
                        <div
                          key={playerName}
                          className="flex min-w-[60px] flex-col items-center"
                        >
                          <span className="text-xs font-bold text-yellow-300">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {playerName}
                          </span>
                          <span className="text-lg font-bold text-yellow-400">
                            {playerScores[playerName] ?? 0}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {showAllResults && gameMode === "multiplayer" && (
              <div className="mb-8 w-full text-center">
                <h3 className="mb-2 text-xl font-bold text-yellow-400">
                  Leaderboard
                </h3>
                <div className="mx-auto mb-4 flex w-fit max-w-full flex-row items-center justify-center gap-6 rounded-full bg-black/80 px-8 py-3 text-white shadow-lg">
                  {playerNames
                    .filter((name) => name.trim() !== "")
                    .sort(
                      (a, b) => (playerScores[b] ?? 0) - (playerScores[a] ?? 0),
                    )
                    .map((playerName, idx) => (
                      <div
                        key={playerName}
                        className="flex min-w-[60px] flex-col items-center"
                      >
                        <span className="text-xs font-bold text-yellow-300">
                          #{idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {playerName}
                        </span>
                        <span className="text-lg font-bold text-yellow-400">
                          {playerScores[playerName] ?? 0}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="text-sm text-white/70">
                  Total Players:{" "}
                  {playerNames.filter((name) => name.trim() !== "").length}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] font-sans text-white">
      <div className="absolute top-6 left-6">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="border-white/20 bg-white/10 px-6 py-3 text-lg text-white hover:bg-white/20"
        >
          ← Back
        </Button>
      </div>

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
    </main>
  );
}
