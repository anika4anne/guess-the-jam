"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGameWebSocket } from "~/hooks/useGameWebSocket";
import { Button } from "~/components/ui/button";

interface GameAnswer {
  song: string;
  artist: string;
  points: number;
  songCorrect: boolean;
  artistCorrect: boolean;
  songRaw?: string;
  artistRaw?: string;
}

interface MultiplayerGameProps {
  roomId: string;
  playerName: string;
  onGameEnd?: (finalScores: Record<string, number>) => void;
}

export function MultiplayerGame({ roomId, playerName, onGameEnd }: MultiplayerGameProps) {
  const {
    isConnected,
    connect,
    disconnect,
    room,
    currentPlayerId,
    isHost,
    submitAnswer,
    getPlayerAnswers,
    waitForAllAnswers,
    lastMessage
  } = useGameWebSocket();

  // Game state
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [gamePhase, setGamePhase] = useState<"waiting" | "playing" | "scoring" | "finished">("waiting");
  const [currentSong, setCurrentSong] = useState("");
  const [currentArtist, setCurrentArtist] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [allAnswers, setAllAnswers] = useState<Record<string, GameAnswer>>({});
  const [waitingForAnswers, setWaitingForAnswers] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Player input
  const [userSongAnswer, setUserSongAnswer] = useState("");
  const [userArtistAnswer, setUserArtistAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Refs
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(0);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    connect(roomId, playerName);
    return () => disconnect();
  }, [roomId, playerName, connect, disconnect]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "gameplay_started":
        if (lastMessage.round) setCurrentRound(lastMessage.round);
        if (lastMessage.totalRounds) setTotalRounds(lastMessage.totalRounds);
        setGamePhase("playing");
        startNewRound();
        break;

      case "chat_round_started":
        if (lastMessage.song) setCurrentSong(lastMessage.song);
        if (lastMessage.artist) setCurrentArtist(lastMessage.artist);
        if (lastMessage.round) setCurrentRound(lastMessage.round);
        if (lastMessage.totalRounds) setTotalRounds(lastMessage.totalRounds);
        if (lastMessage.roundDuration) setTimeLeft(lastMessage.roundDuration / 1000);
        setGamePhase("playing");
        startNewRound();
        break;

      case "answer_submitted":
        if (lastMessage.answers) {
          setAllAnswers(lastMessage.answers);
          
          // Check if all players have answered
          const validPlayers = room?.players.filter(p => p.name.trim() !== "") || [];
          if (Object.keys(lastMessage.answers).length >= validPlayers.length) {
            setWaitingForAnswers(false);
            setShowResults(true);
          }
        }
        break;

      case "chat_round_ended":
        setGamePhase("scoring");
        if (lastMessage.song) setCurrentSong(lastMessage.song);
        if (lastMessage.artist) setCurrentArtist(lastMessage.artist);
        if (lastMessage.scores) {
          const scores: Record<string, number> = {};
          (lastMessage.scores as Array<{ id: string; score: number }>).forEach((score) => {
            scores[score.id] = score.score;
          });
          setPlayerScores(scores);
        }
        endRound();
        break;

      case "game_ended":
        setGamePhase("finished");
        if (lastMessage.finalScores) {
          const finalScores: Record<string, number> = {};
          (lastMessage.finalScores as Array<{ id: string; name: string; score: number }>).forEach((score) => {
            finalScores[score.name] = score.score;
          });
          if (onGameEnd) onGameEnd(finalScores);
        }
        break;
    }
  }, [lastMessage, room?.players, onGameEnd]);

  // Initialize room state when connected
  useEffect(() => {
    if (room) {
      setCurrentRound(room.currentRound);
      setTotalRounds(room.totalRounds);
      setGamePhase(room.gamePhase);
      if (room.settings) {
        // Apply any room settings
      }
    }
  }, [room]);

  const startNewRound = useCallback(() => {
    setUserSongAnswer("");
    setUserArtistAnswer("");
    setHasSubmitted(false);
    setAllAnswers({});
    setWaitingForAnswers(false);
    setShowResults(false);
    
    // Start timer
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    
    roundStartTimeRef.current = Date.now();
    timeIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const endRound = useCallback(() => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    setTimeLeft(0);
  }, []);

  const handleSubmitAnswer = useCallback(async () => {
    if (!userSongAnswer.trim() || !userArtistAnswer.trim() || hasSubmitted) return;

    // Calculate points (simplified scoring)
    const songCorrect = userSongAnswer.toLowerCase().trim() === currentSong.toLowerCase().trim();
    const artistCorrect = userArtistAnswer.toLowerCase().trim() === currentArtist.toLowerCase().trim();
    const points = (songCorrect ? 5 : 0) + (artistCorrect ? 5 : 0);

    const answer: GameAnswer = {
      song: userSongAnswer,
      artist: userArtistAnswer,
      points,
      songCorrect,
      artistCorrect,
      songRaw: userSongAnswer,
      artistRaw: userArtistAnswer,
    };

    // Submit to server
    submitAnswer(answer);
    
    // Update local state
    setHasSubmitted(true);
    setWaitingForAnswers(true);

    // Wait for all answers to come in
    try {
      const allPlayerAnswers = await waitForAllAnswers();
      setAllAnswers(allPlayerAnswers);
      setWaitingForAnswers(false);
      setShowResults(true);
    } catch (error) {
      console.error("Error waiting for answers:", error);
    }
  }, [userSongAnswer, userArtistAnswer, hasSubmitted, currentSong, currentArtist, submitAnswer, waitForAllAnswers]);

  const handleNextRound = useCallback(() => {
    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
      setGamePhase("playing");
      startNewRound();
    } else {
      setGamePhase("finished");
    }
  }, [currentRound, totalRounds, startNewRound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <div className="text-xl text-white mb-4">Connecting to game server...</div>
        <div className="text-gray-400">Please wait while we establish the connection.</div>
      </div>
    );
  }

  if (gamePhase === "waiting") {
    return (
      <div className="text-center p-8">
        <div className="text-xl text-white mb-4">Waiting for game to start...</div>
        <div className="text-gray-400">The host will start the game when all players are ready.</div>
      </div>
    );
  }

  if (gamePhase === "playing") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-white mb-2">
            Round {currentRound} of {totalRounds}
          </div>
          <div className="text-lg text-gray-300 mb-4">
            Time remaining: <span className="text-yellow-400 font-bold">{timeLeft}s</span>
          </div>
          <div className="text-xl text-white mb-2">
            🎵 Guess the song and artist!
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Song Title
            </label>
            <input
              type="text"
              value={userSongAnswer}
              onChange={(e) => setUserSongAnswer(e.target.value)}
              disabled={hasSubmitted}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
              placeholder="Enter song title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Artist
            </label>
            <input
              type="text"
              value={userArtistAnswer}
              onChange={(e) => setUserArtistAnswer(e.target.value)}
              disabled={hasSubmitted}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
              placeholder="Enter artist name..."
            />
          </div>

          <Button
            onClick={handleSubmitAnswer}
            disabled={!userSongAnswer.trim() || !userArtistAnswer.trim() || hasSubmitted}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasSubmitted ? "Answer Submitted!" : "Submit Answer"}
          </Button>

          {waitingForAnswers && (
            <div className="text-center text-gray-300">
              Waiting for other players to submit their answers...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gamePhase === "scoring" || showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-white mb-2">
            Round {currentRound} Results
          </div>
          <div className="text-lg text-gray-300 mb-4">
            The song was: <span className="text-pink-400 font-bold">"{currentSong}"</span> by <span className="text-pink-400 font-bold">{currentArtist}</span>
          </div>
        </div>

        <div className="grid gap-4 mb-6">
          {Object.entries(allAnswers).map(([playerName, answer]) => (
            <div key={playerName} className="bg-white/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{playerName}</span>
                <span className="text-lg font-bold text-pink-400">{answer.points} pts</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Song: </span>
                  <span className={`${answer.songCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {answer.song}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Artist: </span>
                  <span className={`${answer.artistCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {answer.artist}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isHost && currentRound < totalRounds && (
          <div className="text-center">
            <Button
              onClick={handleNextRound}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg"
            >
              Next Round
            </Button>
          </div>
        )}

        {!isHost && currentRound < totalRounds && (
          <div className="text-center text-gray-300">
            Waiting for host to start the next round...
          </div>
        )}
      </div>
    );
  }

  if (gamePhase === "finished") {
    return (
      <div className="text-center p-8">
        <div className="text-3xl font-bold text-white mb-4">🎉 Game Complete!</div>
        <div className="text-xl text-gray-300 mb-6">
          Thanks for playing Guess The Jam!
        </div>
        <div className="text-lg text-white">
          Final scores and winner information will be displayed here.
        </div>
      </div>
    );
  }

  return null;
}
