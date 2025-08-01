"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

const rules = [
  {
    title: "🎧 Listen to the Jam",
    description:
      "After selecting your game settings, you will be taken to the game page where the game begins. The game starts off with a 15 second snippet of a song.",
  },
  {
    title: "🎤 Guess the Song & Artist",
    description:
      "Earn points by entering the correct song title and artist. Each questions is 5 points.",
  },
  {
    title: "⏳ Beat the Clock",
    description:
      "You've got limited time each round to answer. Answer quickly before the questions disappear.",
  },
  {
    title: "👯 One Player at a Time",
    description:
      "Each player gets their own turn to guess. No peeking, when playing on multiplayer mode all answers are masked.",
  },
  {
    title: "🏆 Become the Jam Master",
    description:
      "Rack up the highest score across rounds to become the ultimate Jam Master. The game will end when the rounds are over, and will show you your final score.",
  },
  {
    title: "🔗 Share the Vibes",
    description: "Copy your game link and invite friends to join your jam.",
  },
];

export default function RulesPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay blocked:", err);
      });
    }
  }, []);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main className="bg-stars relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-[#0b0f29] via-[#0d1a40] to-[#010314] px-6 py-20 font-sans text-white">
      <audio
        ref={audioRef}
        src="/src/music.mp3"
        preload="auto"
        style={{ display: "none" }}
      />

      <div className="animate-wave pointer-events-none absolute top-0 left-0 h-full w-24">
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

      {/* Vine Waves Right */}
      <div className="animate-wave pointer-events-none absolute top-0 right-0 h-full w-24 scale-x-[-1]">
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

      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          ← Back
        </Button>
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center text-5xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-6xl"
      >
        Rules
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-6 max-w-2xl text-center text-lg text-gray-300"
      >
        Scroll down and vibe with the rules.
      </motion.p>

      {/* Rules List */}
      <section className="mx-auto mt-24 w-full max-w-4xl space-y-48">
        {rules.map((rule, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.3 }}
            className="px-4 text-center"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-4xl font-bold text-transparent">
              {rule.title}
            </h2>
            <p className="text-lg text-gray-400">{rule.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Animations */}
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
        .bg-stars {
          background-image: url("https://asgsr.org/wp-content/uploads/2020/01/iStock-697020460-scaled.jpg");
          background-size: cover;
        }
      `}</style>
    </main>
  );
}
