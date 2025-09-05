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
  const [timeLeft, setTimeLeft] = useState(30);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedSongs, setUsedSongs] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setGamePhase("playing");
    setRound(1);
    setScore(0);
    setTotalRounds(5);
    setUsedSongs([]);
    startNewRound();
  };

  const startNewRound = () => {
    const availableSongs = songs.filter((song) => !usedSongs.includes(song.id));
    if (availableSongs.length === 0) {
      setGamePhase("complete");
      return;
    }

    const randomSong =
      availableSongs[Math.floor(Math.random() * availableSongs.length)];
    setCurrentSong(randomSong ?? null);
    setUserInput("");
    setTimeLeft(30);
    setIsCorrect(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = () => {
    if (!currentSong || !userInput.trim()) {
      setIsCorrect(false);
      nextRound();
      return;
    }

    const userAnswer = userInput.toLowerCase().trim();
    const correctAnswer = currentSong.fullLyrics.toLowerCase().trim();

    const isAnswerCorrect =
      correctAnswer.includes(userAnswer) ||
      userAnswer.includes(correctAnswer) ||
      checkPartialMatch(userAnswer, correctAnswer);

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
    const userWords = userAnswer.split(/\s+/);
    const correctWords = correctAnswer.split(/\s+/);

    let matches = 0;
    for (const word of userWords) {
      if (
        correctWords.some(
          (correctWord) =>
            correctWord.includes(word) || word.includes(correctWord),
        )
      ) {
        matches++;
      }
    }

    return (
      matches >= Math.min(userWords.length * 0.6, correctWords.length * 0.6)
    );
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
  };

  const handleBack = () => {
    router.push("/");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
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

        <h1 className="mb-8 text-4xl font-bold text-yellow-400">
          Lyrics Challenge
        </h1>

        <div className="w-full max-w-4xl rounded-2xl bg-white/10 p-8 shadow-lg backdrop-blur-md">
          <p className="mb-6 text-center text-lg text-white/80">
            Complete the lyrics and show off your memory! You&apos;ll see the
            beginning of a song and need to type out the rest. Get as close as
            you can!
          </p>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4 text-center">
              <h3 className="mb-2 text-lg font-semibold text-yellow-400">
                Easy
              </h3>
              <p className="text-sm text-white/80">
                Popular hits everyone knows
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 text-center">
              <h3 className="mb-2 text-lg font-semibold text-yellow-400">
                Medium
              </h3>
              <p className="text-sm text-white/80">Chart-topping favorites</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 text-center">
              <h3 className="mb-2 text-lg font-semibold text-yellow-400">
                Hard
              </h3>
              <p className="text-sm text-white/80">For the true music fans</p>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-yellow-600 px-8 py-3 text-lg font-semibold text-white hover:bg-yellow-700"
            >
              Start Challenge
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (gamePhase === "complete") {
    return (
      <main className="pick-artist-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
        <div className="w-full max-w-2xl rounded-2xl bg-white/10 p-8 text-center shadow-lg backdrop-blur-md">
          <h1 className="mb-6 text-4xl font-bold text-yellow-400">
            Challenge Complete! 🎵
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
                  : "Better luck next time! The music world is vast 🎶"}
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
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the rest of the lyrics here..."
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
                {isCorrect ? "🎉 Nice one!" : "😅 Close!"}
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
