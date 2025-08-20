"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";

interface ChatGameModeProps {
  roomId: string;
  playerName: string;
  onSendMessage: (message: { type: string; [key: string]: unknown }) => void;
  lastMessage: { type: string; [key: string]: unknown } | null;
}

interface ChatMessage {
  id: string;
  playerName: string;
  message: string;
  type: "guess" | "system" | "correct" | "incorrect";
  timestamp: number;
}

export function ChatGameMode({ onSendMessage, lastMessage }: ChatGameModeProps) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentSong, setCurrentSong] = useState("");
  const [currentArtist, setCurrentArtist] = useState("");
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gamePhase, setGamePhase] = useState<"waiting" | "playing" | "scoring" | "finished">("waiting");
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [finalScores, setFinalScores] = useState<Array<{ id: string; name: string; score: number }>>([]);
  const [winner, setWinner] = useState<{ id: string; name: string; score: number } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "chat_round_started":
        setCurrentSong((lastMessage.song as string) ?? "");
        setCurrentArtist((lastMessage.artist as string) ?? "");
        setRoundNumber((lastMessage.round as number) ?? 1);
        setTotalRounds((lastMessage.totalRounds as number) ?? 10);
        setTimeLeft(lastMessage.roundDuration ? (lastMessage.roundDuration as number) / 1000 : 30);
        setGamePhase("playing");
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          playerName: "System",
          message: `🎵 Round ${lastMessage.round as number} started! Guess the song name.`,
          type: "system",
          timestamp: Date.now()
        }]);
        startTimer();
        break;

      case "chat_guess_correct":
        setPlayerScores(prev => ({
          ...prev,
          [lastMessage.playerId as string]: lastMessage.score as number
        }));
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          playerName: lastMessage.playerName as string,
          message: `🎯 Correctly guessed: "${lastMessage.guess as string}" (+10 points)`,
          type: "correct",
          timestamp: Date.now()
        }]);
        break;

      case "chat_guess_incorrect":
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          playerName: lastMessage.playerName as string,
          message: `❌ Guessed: "${lastMessage.guess as string}"`,
          type: "incorrect",
          timestamp: Date.now()
        }]);
        break;

      case "chat_round_ended":
        setGamePhase("scoring");
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          playerName: "System",
          message: `⏰ Round ended! The song was &quot;${lastMessage.song as string}&quot; by ${lastMessage.artist as string}`,
          type: "system",
          timestamp: Date.now()
        }]);
        if (lastMessage.scores) {
          const scores: Record<string, number> = {};
          (lastMessage.scores as Array<{ id: string; score: number }>).forEach((score) => {
            scores[score.id] = score.score;
          });
          setPlayerScores(scores);
        }
        if (timeIntervalRef.current) {
          clearInterval(timeIntervalRef.current);
        }
        break;

      case "game_ended":
        setGamePhase("finished");
        setFinalScores((lastMessage.finalScores as Array<{ id: string; name: string; score: number }>) ?? []);
        setWinner((lastMessage.winner as { id: string; name: string; score: number }) ?? null);
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          playerName: "System",
          message: `🏁 Game Over! ${(lastMessage.winner as { id: string; name: string; score: number })?.name ?? "Unknown"} wins with ${(lastMessage.winner as { id: string; name: string; score: number })?.score ?? 0} points!`,
          type: "system",
          timestamp: Date.now()
        }]);
        break;
    }
  }, [lastMessage]);

  const startTimer = () => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    
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
  };

  const handleSendGuess = () => {
    if (!chatInput.trim() || gamePhase !== "playing") return;

    onSendMessage({
      type: "chat_guess",
      guess: chatInput.trim()
    });

    setChatInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendGuess();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  if (gamePhase === "finished") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 text-white">
        <div className="w-full max-w-4xl text-center">
          <h1 className="mb-8 text-6xl font-bold text-yellow-400">🏆 Game Over! 🏆</h1>
          
          {winner && (
            <div className="mb-8 rounded-lg bg-yellow-500/20 p-6 border-2 border-yellow-400">
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">Winner: {winner.name}</h2>
              <p className="text-xl">Score: {winner.score} points</p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Final Standings</h3>
            <div className="space-y-2">
              {finalScores.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </span>
                    <span className="text-xl">{player.name}</span>
                  </div>
                  <span className="text-xl font-bold">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => window.location.href = "/private"}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg font-semibold"
          >
            Back to Private Rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Left Panel - Game Info */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Guess The Jam</h1>
          <div className="text-xl text-white/80">
            Round {roundNumber} of {totalRounds}
          </div>
        </div>

        {gamePhase === "playing" && (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎵</div>
              <div className="text-2xl font-bold text-white mb-2">Song Playing...</div>
              <div className="text-lg text-white/80">Listen carefully and guess the song name!</div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {timeLeft}s
              </div>
              <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {gamePhase === "scoring" && (
          <div className="text-center">
            <div className="text-6xl mb-4">⏰</div>
            <div className="text-2xl font-bold text-white mb-2">Round Ended!</div>
            <div className="text-lg text-white/80 mb-4">
              The song was: <span className="font-bold text-green-400">&quot;{currentSong}&quot;</span>
            </div>
            <div className="text-lg text-white/80">
              by <span className="font-bold text-blue-400">{currentArtist}</span>
            </div>
          </div>
        )}

        {/* Player Scores */}
        <div className="mt-8 w-full max-w-md">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Scores</h3>
          <div className="space-y-2">
            {Object.entries(playerScores).map(([playerId, score]) => (
              <div key={playerId} className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                <span className="text-white">{playerId === "you" ? "You" : playerId}</span>
                <span className="font-bold text-yellow-400">{score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="w-96 bg-white flex flex-col">
        <div className="bg-gray-100 p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 text-center">Chat/Guess</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`p-3 rounded-lg ${
              msg.type === "system" ? "bg-blue-100 text-blue-800" :
              msg.type === "correct" ? "bg-green-100 text-green-800" :
              msg.type === "incorrect" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              <div className="font-semibold text-sm">{msg.playerName}</div>
              <div className="text-sm">{msg.message}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Chat or guess here..."
              disabled={gamePhase !== "playing"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Button
              onClick={handleSendGuess}
              disabled={!chatInput.trim() || gamePhase !== "playing"}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              SEND
            </Button>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-lg">
              👍
            </Button>
            <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-lg">
              👎
            </Button>
            <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-lg">
              👏
            </Button>
            <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-lg">
              🤘
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
