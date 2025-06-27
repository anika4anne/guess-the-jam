"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  const handlePlayClick = () => {
    router.push("/playnow");
  };

  return (
    <>
      <Head>
        <meta
          name="google-site-verification"
          content="zEZGZzIJs883ISjbIKObStMehRR8Hoxkoo1bL5KQDmk"
        />
      </Head>

      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] font-sans text-white">
        {/* animated waves */}
        <div className="animate-wave pointer-events-none absolute top-0 left-0 h-full w-24 opacity-20">
          <svg
            viewBox="0 0 100 600"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
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
            🎵 Guess the <span className="text-yellow-300">Jam</span> 🎶
          </h1>
          <p className="max-w-2xl text-center text-xl text-white/80">
            Can you guess the song just by hearing a short snippet? Test your
            music knowledge and race against the clock!
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
            <button
              onClick={handlePlayClick}
              className="flex max-w-xs flex-col gap-3 rounded-2xl bg-white/10 p-6 text-white shadow-md transition-all hover:bg-white/20"
            >
              <h3 className="text-2xl font-bold text-yellow-300">Play Now →</h3>
              <p className="text-lg">Start guessing songs in our game mode!</p>
            </button>

            <Link
              href="/rules"
              className="flex max-w-xs flex-col gap-3 rounded-2xl bg-white/10 p-6 text-white shadow-md transition-all hover:bg-white/20"
            >
              <h3 className="text-2xl font-bold text-blue-300">
                How to Play →
              </h3>
              <p className="text-lg">Learn the rules and get pro tips!</p>
            </Link>
          </div>

          {/* Private Room section */}
          <div className="mt-12 text-center">
            <h2 className="mb-6 text-3xl font-semibold text-white">
              Private Rooms
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
              <Link
                href="/private/create"
                className="flex max-w-xs flex-col items-center justify-center gap-3 rounded-2xl bg-white/10 p-8 text-white shadow-md transition-all hover:bg-white/20 sm:max-w-md"
              >
                <h3 className="text-center text-2xl font-bold text-green-300">
                  Create Private Room →
                </h3>
                <p className="text-center text-lg">
                  Start a private game with friends!
                </p>
              </Link>

              <Link
                href="/private/join"
                className="flex max-w-xs flex-col items-center justify-center gap-3 rounded-2xl bg-white/10 p-6 text-white shadow-md transition-all hover:bg-white/20"
              >
                <h3 className="text-center text-2xl font-bold text-pink-300">
                  Join Private Room →
                </h3>
                <p className="text-center text-lg">
                  Enter a private room with a code!
                </p>
              </Link>
            </div>
          </div>

          {/* Discord Invite section */}
          <div className="mt-10 flex flex-col items-center">
            <a
              href="https://discord.gg/Ny8Vr8zjYK"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[#5865F2] bg-white/5 px-4 py-2 text-white shadow-sm transition-all hover:bg-[#5865F2]/20 focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 focus:outline-none"
              style={{ textDecoration: "none" }}
            >
              <Image
                src="/discord.png"
                alt="Discord logo"
                width={28}
                height={28}
                className="rounded"
              />
              <span className="text-base font-semibold">Join the server!</span>
            </a>
          </div>
        </div>

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
    </>
  );
}
