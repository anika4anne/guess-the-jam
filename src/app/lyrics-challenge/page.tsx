"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

interface Song {
  id: string;
  title: string;
  artist: string;
  partialLyrics: string;
  fullLyrics: string;
  difficulty: "easy" | "medium" | "hard";
}

const songs: Song[] = [
  {
    id: "1",
    title: "Shake It Off",
    artist: "Taylor Swift",
    partialLyrics: "I stay up too late, got nothing in my brain",
    fullLyrics:
      "I stay up too late, got nothing in my brain, that's what people say, that's what people say",
    difficulty: "easy",
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    partialLyrics:
      "I've been tryin' to call, I've been on my own for long enough",
    fullLyrics:
      "I've been tryin' to call, I've been on my own for long enough, maybe you can show me how to love, maybe",
    difficulty: "medium",
  },
  {
    id: "3",
    title: "Bad Guy",
    artist: "Billie Eilish",
    partialLyrics: "So you're a tough guy, like it really rough guy",
    fullLyrics:
      "So you're a tough guy, like it really rough guy, just can't get enough guy, chest always so puffed guy",
    difficulty: "easy",
  },
  {
    id: "4",
    title: "God's Plan",
    artist: "Drake",
    partialLyrics: "I been movin' calm, don't start no trouble with me",
    fullLyrics:
      "I been movin' calm, don't start no trouble with me, tryna keep it peaceful is a struggle for me",
    difficulty: "medium",
  },
  {
    id: "5",
    title: "7 Rings",
    artist: "Ariana Grande",
    partialLyrics: "Breakfast at Tiffany's and bottles of bubbles",
    fullLyrics:
      "Breakfast at Tiffany's and bottles of bubbles, girls with tattoos who like getting in trouble",
    difficulty: "hard",
  },
  {
    id: "6",
    title: "Shape of You",
    artist: "Ed Sheeran",
    partialLyrics: "The club isn't the best place to find a lover",
    fullLyrics:
      "The club isn't the best place to find a lover, so the bar is where I go",
    difficulty: "easy",
  },
];

export default function LyricsChallengePage() {
  const router = useRouter();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [gamePhase, setGamePhase] = useState<
    "select" | "playing" | "result" | "complete"
  >("select");
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedSongs, setUsedSongs] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard" | null
  >(null);
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    if (!selectedDifficulty) return;
    setGamePhase("playing");
    setRound(1);
    setScore(0);
    setTotalRounds(5);
    setUsedSongs([]);
    startNewRound();
  };

  const startNewRound = () => {
    if (!selectedDifficulty) return;

    const availableSongs = songs.filter(
      (song) =>
        !usedSongs.includes(song.id) && song.difficulty === selectedDifficulty,
    );
    if (availableSongs.length === 0) {
      setGamePhase("complete");
      return;
    }

    const randomSong =
      availableSongs[Math.floor(Math.random() * availableSongs.length)];
    setCurrentSong(randomSong ?? null);
    setUserInput("");
    setTimeLeft(10);
    setIsCorrect(false);
    setIsTyping(false);
    setGamePhase("playing");

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!isTyping) {
            setTimeout(() => handleSubmit(), 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = () => {
    if (!currentSong) {
      setIsCorrect(false);
      nextRound();
      return;
    }

    const userAnswer = userInput.toLowerCase().trim();
    const correctAnswer = currentSong.fullLyrics.toLowerCase().trim();

    let isAnswerCorrect = false;

    if (userAnswer.length === 0) {
      isAnswerCorrect = false;
    } else {
      if (
        correctAnswer.includes(userAnswer) ||
        userAnswer.includes(correctAnswer)
      ) {
        isAnswerCorrect = true;
      } else {
        isAnswerCorrect = checkPartialMatch(userAnswer, correctAnswer);
      }
    }

    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore((prev) => prev + 10);
    }

    setGamePhase("result");

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const checkPartialMatch = (userAnswer: string, correctAnswer: string) => {
    const userWords = userAnswer.split(/\s+/).filter((word) => word.length > 1);
    const correctWords = correctAnswer
      .split(/\s+/)
      .filter((word) => word.length > 1);

    if (userWords.length === 0) return false;

    let matches = 0;
    for (const word of userWords) {
      if (
        correctWords.some(
          (correctWord) =>
            correctWord.toLowerCase().includes(word.toLowerCase()) ||
            word.toLowerCase().includes(correctWord.toLowerCase()),
        )
      ) {
        matches++;
      }
    }

    const requiredMatches = Math.max(2, Math.floor(userWords.length * 0.3));
    return matches >= requiredMatches;
  };

  const nextRound = () => {
    if (currentSong) {
      setUsedSongs((prev) => [...prev, currentSong.id]);
    }

    if (round >= totalRounds) {
      setGamePhase("complete");
    } else {
      setRound((prev) => prev + 1);
      startNewRound();
    }
  };

  const resetGame = () => {
    setGamePhase("select");
    setScore(0);
    setRound(1);
    setUsedSongs([]);
    setCurrentSong(null);
    setUserInput("");
    setSelectedDifficulty(null);
    setShowSettings(false);
  };

  const handleBack = () => {
    router.push("/");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (gamePhase === "select") {
    return (
      <main className="pick-artist-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
        <div className="absolute top-6 left-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            ← Back to Home
          </Button>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          <h1 className="text-4xl font-bold text-yellow-400">
            Lyrics Challenge
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white transition-all hover:bg-white/20"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Game Settings</span>
          </button>
        </div>

        <div className="w-full max-w-4xl rounded-2xl bg-white/10 p-8 shadow-lg backdrop-blur-md">
          <p className="mb-6 text-center text-lg text-white/80">
            Complete the lyrics and show off your memory! You&apos;ll see the
            beginning of a song and need to type out the rest. Get as close as
            you can!
          </p>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              onClick={() => setSelectedDifficulty("easy")}
              className={`rounded-xl p-4 text-center transition-all ${
                selectedDifficulty === "easy"
                  ? "bg-yellow-400 text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <h3 className="mb-2 text-lg font-semibold">Easy</h3>
              <p className="text-sm opacity-80">Popular hits everyone knows</p>
            </button>
            <button
              onClick={() => setSelectedDifficulty("medium")}
              className={`rounded-xl p-4 text-center transition-all ${
                selectedDifficulty === "medium"
                  ? "bg-yellow-400 text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <h3 className="mb-2 text-lg font-semibold">Medium</h3>
              <p className="text-sm opacity-80">Billboard favorites</p>
            </button>
            <button
              onClick={() => setSelectedDifficulty("hard")}
              className={`rounded-xl p-4 text-center transition-all ${
                selectedDifficulty === "hard"
                  ? "bg-yellow-400 text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <h3 className="mb-2 text-lg font-semibold">Hard</h3>
              <p className="text-sm opacity-80">For the true music fans</p>
            </button>
          </div>

          <div className="text-center">
            <Button
              onClick={startGame}
              disabled={!selectedDifficulty}
              className={`px-8 py-3 text-lg font-semibold text-white ${
                selectedDifficulty
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "cursor-not-allowed bg-gray-600"
              }`}
            >
              Start Challenge
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-black p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Game Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/60 hover:text-white"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-white">
                  Number of Rounds
                </label>
                <select
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-pink-400 focus:outline-none"
                >
                  <option value={3} className="bg-gray-800">
                    3 rounds
                  </option>
                  <option value={5} className="bg-gray-800">
                    5 rounds
                  </option>
                  <option value={10} className="bg-gray-800">
                    10 rounds
                  </option>
                  <option value={15} className="bg-gray-800">
                    15 rounds
                  </option>
                  <option value={20} className="bg-gray-800">
                    20 rounds
                  </option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-600 py-2 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-pink-500 py-2 text-white hover:bg-pink-600"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  if (gamePhase === "complete") {
    return (
      <main className="pick-artist-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
        <div className="w-full max-w-2xl rounded-2xl bg-white/10 p-8 text-center shadow-lg backdrop-blur-md">
          <h1 className="mb-6 text-4xl font-bold text-yellow-400">
            Challenge Complete!
          </h1>
          <p className="mb-4 text-2xl text-white">
            You scored{" "}
            <span className="font-bold text-yellow-400">{score}</span> points
          </p>
          <p className="mb-8 text-lg text-white/80">
            {score >= 40
              ? "You're a lyrics legend! 🔥"
              : score >= 30
                ? "Pretty impressive! You know your songs 👌"
                : score >= 20
                  ? "Not bad! Keep practicing those lyrics 💪"
                  : "Better luck next time!"}
          </p>

          <div className="space-y-4">
            <Button
              onClick={resetGame}
              className="w-full bg-yellow-600 py-3 text-lg font-semibold text-white hover:bg-yellow-700"
            >
              Try Again
            </Button>
            <Button
              onClick={handleBack}
              className="w-full bg-gray-600 py-3 text-lg font-semibold text-white hover:bg-gray-700"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pick-artist-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
      <div className="absolute top-6 left-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          ← Back to Home
        </Button>
      </div>

      <div className="w-full max-w-2xl rounded-2xl bg-white/10 p-8 shadow-lg backdrop-blur-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">
            Lyrics Challenge
          </h1>
          <div className="text-right">
            <p className="text-white">
              Round {round} of {totalRounds}
            </p>
            <p className="font-bold text-yellow-400">Score: {score}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-white/60">
            <span>Progress</span>
            <span>{Math.round((round / totalRounds) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${(round / totalRounds) * 100}%` }}
            ></div>
          </div>
        </div>

        {gamePhase === "playing" && currentSong && (
          <>
            <div className="mb-6 text-center">
              <h2 className="mb-4 text-xl text-white">Complete the lyrics:</h2>
              <div className="mb-4 rounded-lg bg-white/5 p-4">
                <p className="mb-2 text-lg text-white/80">
                  <span className="font-semibold text-yellow-400">
                    &quot;{currentSong.title}&quot;
                  </span>{" "}
                  by{" "}
                  <span className="font-semibold text-pink-300">
                    {currentSong.artist}
                  </span>
                </p>
                <p className="text-2xl font-bold text-white">
                  &quot;{currentSong.partialLyrics}...&quot;
                </p>
              </div>
              <div className="mb-4">
                <div className="mb-2 text-lg text-white">⏰ Time Left:</div>
                <div className="text-4xl font-bold text-yellow-400">
                  {timeLeft}s
                </div>
              </div>
            </div>

            <div className="mb-6">
              <textarea
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setIsTyping(true);

                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }

                  typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                  }, 2000);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    setIsTyping(false);
                    handleSubmit();
                  }
                }}
                onBlur={() => setIsTyping(false)}
                placeholder="Type the rest of the lyrics here... (Ctrl+Enter to submit)"
                className="w-full rounded-lg bg-white/10 p-4 text-lg text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                rows={4}
                autoFocus
              />
            </div>

            <div className="text-center">
              <Button
                onClick={handleSubmit}
                className="bg-yellow-600 px-8 py-3 text-lg font-semibold text-white hover:bg-yellow-700"
              >
                Submit Answer
              </Button>
            </div>
          </>
        )}

        {gamePhase === "result" && currentSong && (
          <div className="text-center">
            <div className="mb-6">
              <h2 className="mb-4 text-2xl font-bold">
                {isCorrect ? "🎉 Nice one!" : "❌ Not quite!"}
              </h2>
              <p className="mb-2 text-lg text-white">
                Song:{" "}
                <span className="font-bold text-yellow-400">
                  &quot;{currentSong.title}&quot;
                </span>
              </p>
              <p className="mb-2 text-lg text-white">
                Artist:{" "}
                <span className="font-bold text-pink-300">
                  {currentSong.artist}
                </span>
              </p>
              <div className="mb-4 rounded-lg bg-white/5 p-4">
                <p className="mb-2 text-white">Your answer:</p>
                <p className="text-lg text-white/80">&quot;{userInput}&quot;</p>
                <p className="mt-2 text-white">Correct lyrics:</p>
                <p className="text-lg text-white/80">
                  &quot;{currentSong.fullLyrics}&quot;
                </p>
              </div>
              {isCorrect && (
                <p className="mt-2 font-bold text-green-400">+10 points! 🎵</p>
              )}
            </div>

            <Button
              onClick={nextRound}
              className="bg-yellow-600 px-8 py-3 text-lg font-semibold text-white hover:bg-yellow-700"
            >
              {round >= totalRounds ? "See Results" : "Next Song"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
