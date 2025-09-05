"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

interface Artist {
  id: string;
  name: string;
  image: string;
  songs: string[];
}

const artists: Artist[] = [
  {
    id: "1",
    name: "Taylor Swift",
    image:
      "https://www.ensembleschools.com/the-inside-voice/wp-content/uploads/sites/47/2016/11/taylore-swift-kid-appropriate-songs-to-sing.jpg",
    songs: [
      "Shake It Off",
      "Love Story",
      "Anti-Hero",
      "Blank Space",
      "You Belong With Me",
    ],
  },
  {
    id: "2",
    name: "Drake",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO8mIGIKONJtXjHVRvWi1-K0rIiW8KjWpc2gtroCxrUab-P7bzgSXnrAOIsDSMwXfaO1_3c5vtHrlplEwUDuAnnJggr01SOeUorWwW67k",
    songs: [
      "God's Plan",
      "One Dance",
      "Hotline Bling",
      "In My Feelings",
      "Started From The Bottom",
    ],
  },
  {
    id: "3",
    name: "Billie Eilish",
    image:
      "https://static01.nyt.com/images/2020/03/15/magazine/15mag-billie-03/15mag-billie-03-superJumbo-v3.jpg",
    songs: [
      "Bad Guy",
      "Lovely",
      "Happier Than Ever",
      "Therefore I Am",
      "Ocean Eyes",
    ],
  },
  {
    id: "4",
    name: "The Weeknd",
    image: "https://i.scdn.co/image/ab6761610000e5ebec0b9c1a2a8b8b8b8b8b8b8b",
    songs: [
      "Blinding Lights",
      "Starboy",
      "The Hills",
      "Save Your Tears",
      "Can't Feel My Face",
    ],
  },
  {
    id: "5",
    name: "Ariana Grande",
    image: "https://i.scdn.co/image/ab6761610000e5ebec0b9c1a2a8b8b8b8b8b8b8b",
    songs: [
      "Thank U, Next",
      "7 Rings",
      "Positions",
      "Side To Side",
      "No Tears Left To Cry",
    ],
  },
  {
    id: "6",
    name: "Ed Sheeran",
    image: "https://i.scdn.co/image/ab6761610000e5ebec0b9c1a2a8b8b8b8b8b8b8b",
    songs: [
      "Shape of You",
      "Perfect",
      "Thinking Out Loud",
      "Photograph",
      "Castle on the Hill",
    ],
  },
];

export default function PickArtistPage() {
  const router = useRouter();
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [currentSong, setCurrentSong] = useState<string>("");
  const [userGuess, setUserGuess] = useState<string>("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gamePhase, setGamePhase] = useState<
    "select" | "playing" | "result" | "complete"
  >("select");
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtists((prev) => {
      if (prev.includes(artistId)) {
        return prev.filter((id) => id !== artistId);
      } else {
        return [...prev, artistId];
      }
    });
  };

  const startGame = () => {
    if (selectedArtists.length === 0) return;

    setGamePhase("playing");
    setRound(1);
    setScore(0);
    setTotalRounds(10);
    startNewRound();
  };

  const startNewRound = () => {
    const availableArtists = artists.filter((artist) =>
      selectedArtists.includes(artist.id),
    );
    if (availableArtists.length === 0) return;

    const randomArtist =
      availableArtists[Math.floor(Math.random() * availableArtists.length)];
    if (!randomArtist) return;

    const randomSong =
      randomArtist.songs[Math.floor(Math.random() * randomArtist.songs.length)];
    if (!randomSong) return;

    // Generate multiple choice options (correct answer + 3 wrong answers)
    const correctAnswer = randomArtist.name;
    const wrongAnswers = artists
      .filter((artist) => artist.id !== randomArtist.id)
      .map((artist) => artist.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...wrongAnswers].sort(
      () => Math.random() - 0.5,
    );

    setCurrentArtist(randomArtist);
    setCurrentSong(randomSong);
    setAnswerOptions(allOptions);
    setUserGuess("");
    setTimeLeft(30);
    setGamePhase("playing");

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCorrect(false);
    setGamePhase("result");
  };

  const handleSubmit = (selectedArtist: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const isCorrectGuess = selectedArtist === currentArtist?.name;
    setIsCorrect(isCorrectGuess);
    setUserGuess(selectedArtist);

    if (isCorrectGuess) {
      setScore((prev) => prev + 10);
    }

    setGamePhase("result");
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      setGamePhase("complete");
      return;
    }

    setRound((prev) => prev + 1);
    startNewRound();
  };

  const resetGame = () => {
    setGamePhase("select");
    setSelectedArtists([]);
    setScore(0);
    setRound(1);
    setUserGuess("");
    setCurrentArtist(null);
    setCurrentSong("");
    setAnswerOptions([]);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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

        <h1 className="mb-8 text-4xl font-bold text-pink-300">
          Pick Artist Mode
        </h1>

        <div className="w-full max-w-4xl rounded-2xl bg-white/10 p-8 shadow-lg backdrop-blur-md">
          <p className="mb-6 text-center text-lg text-white/80">
            Select the artists you want to guess songs from. You&apos;ll be
            given song titles and need to identify which artist sings them!
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {artists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleArtistSelect(artist.id)}
                className={`cursor-pointer rounded-xl p-4 transition-all ${
                  selectedArtists.includes(artist.id)
                    ? "bg-pink-500 ring-2 ring-pink-300"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <div className="text-center">
                  <div className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-full">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-white">{artist.name}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={startGame}
              disabled={selectedArtists.length === 0}
              className={`px-8 py-3 text-lg font-semibold ${
                selectedArtists.length === 0
                  ? "cursor-not-allowed bg-gray-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Start Game ({selectedArtists.length} artist
              {selectedArtists.length !== 1 ? "s" : ""} selected)
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
          <h1 className="mb-6 text-4xl font-bold text-pink-300">
            Game Complete!
          </h1>
          <p className="mb-4 text-2xl text-white">
            Final Score:{" "}
            <span className="font-bold text-yellow-400">{score}</span>
          </p>
          <p className="mb-8 text-lg text-white/80">
            You got {score / 10} out of {totalRounds} songs correct!
          </p>

          <div className="space-y-4">
            <Button
              onClick={resetGame}
              className="w-full bg-green-600 py-3 text-lg font-semibold text-white hover:bg-green-700"
            >
              Play Again
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
          <h1 className="text-2xl font-bold text-pink-300">Pick Artist Mode</h1>
          <div className="text-right">
            <p className="text-white">
              Round {round} of {totalRounds}
            </p>
            <p className="font-bold text-yellow-400">Score: {score}</p>
          </div>
        </div>

        {gamePhase === "playing" && (
          <>
            <div className="mb-6 text-center">
              <h2 className="mb-4 text-xl text-white">Guess the Artist!</h2>
              <p className="mb-4 text-3xl font-bold text-pink-300">
                {currentSong}
              </p>
              <div className="mb-4">
                <div className="mb-2 text-lg text-white">Time Left:</div>
                <div className="text-4xl font-bold text-yellow-400">
                  {timeLeft}s
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {answerOptions.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleSubmit(option)}
                  className="bg-white/10 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-pink-500 hover:text-white"
                >
                  {option}
                </Button>
              ))}
            </div>
          </>
        )}

        {gamePhase === "result" && (
          <div className="text-center">
            <div className="mb-6">
              <h2 className="mb-4 text-2xl font-bold">
                {isCorrect ? "🎉 Correct!" : "❌ Wrong!"}
              </h2>
              <p className="mb-2 text-lg text-white">
                The song was:{" "}
                <span className="font-bold text-pink-300">{currentSong}</span>
              </p>
              <p className="mb-2 text-lg text-white">
                By:{" "}
                <span className="font-bold text-yellow-400">
                  {currentArtist?.name}
                </span>
              </p>
              <p className="text-lg text-white">
                Your answer:{" "}
                <span
                  className={`font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}
                >
                  {userGuess}
                </span>
              </p>
              {isCorrect && (
                <p className="mt-2 font-bold text-green-400">+10 points!</p>
              )}
            </div>

            <Button
              onClick={nextRound}
              className="bg-green-600 px-8 py-3 text-lg font-semibold text-white hover:bg-green-700"
            >
              {round >= totalRounds ? "Finish Game" : "Next Round"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
