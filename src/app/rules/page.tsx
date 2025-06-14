"use client";

import { motion } from "framer-motion";

const rules = [
  {
    title: "🎧 Listen to the Jam",
    description:
      "Each round starts with a snippet of a song. Focus, feel the beat, and get ready to guess.",
  },
  {
    title: "🎤 Guess the Song & Artist",
    description:
      "Earn points by entering the correct song title and artist. Trust your music memory!",
  },
  {
    title: "⏳ Beat the Clock",
    description:
      "You’ve got limited time each round. Answer quickly before the beat fades away.",
  },
  {
    title: "👯 One Player at a Time",
    description:
      "Each player gets their own turn to guess. No peeking — fairness keeps the jam real.",
  },
  {
    title: "🏆 Become the Jam Master",
    description:
      "Rack up the highest score across rounds to become the ultimate Jam Master.",
  },
  {
    title: "🔗 Share the Vibes",
    description:
      "Copy your game link and invite friends to join your jam. Music is better together.",
  },
];

export default function RulesPage() {
  return (
    <main className="bg-stars relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-[#0b0f29] via-[#0d1a40] to-[#010314] px-6 py-20 font-sans text-white">
      {/* Vine Waves Left */}
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

      {/* Rules */}
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

      {/* Footer */}
      <footer className="mt-32 flex w-full items-center justify-end px-8 py-4 text-white">
        <div className="text-sm">
          <p>© Copyright 2025 Anika. All rights reserved.</p>
        </div>
      </footer>

      {/* Animation Styling */}
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
          background-image: url("https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_2560/https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_300/https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1024/https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_768/https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1536/https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_2048/https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_800/https://asgsr.org/wp-content/uploads/2020/01/iStock-697020460-scaled.jpg");
          background-size: cover;
        }
      `}</style>
    </main>
  );
}
