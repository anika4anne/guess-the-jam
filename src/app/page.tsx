"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Head from "next/head";

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

      <main
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden font-sans text-white"
        style={{
          backgroundImage: "url(/final.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute top-20 left-8 h-2 w-2 animate-pulse rounded-full bg-pink-300/30"></div>
        <div className="absolute top-40 right-12 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300/40 delay-1000"></div>
        <div className="absolute top-60 left-1/4 h-1 w-1 animate-pulse rounded-full bg-purple-300/50 delay-2000"></div>

        <div className="container -mt-32 flex flex-col items-center justify-center gap-12 px-4 py-8">
          <h1 className="text-center text-5xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-[4rem]">
            🎵 Guess the <span className="text-pink-300">Jam</span> 🎶
          </h1>
          <p className="max-w-2xl text-center text-xl text-white/80"></p>

          <div className="-mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
            <button
              onClick={handlePlayClick}
              className="group relative flex max-w-xs flex-col gap-3 rounded-2xl p-6 text-left text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ backgroundColor: "#1E40AF" }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <h3 className="relative text-2xl font-bold text-yellow-300">
                Play Now →
              </h3>
              <p className="relative text-lg">
                Start guessing songs in our game mode!
              </p>
            </button>

            <Link
              href="/rules"
              className="group relative flex max-w-xs flex-col gap-3 rounded-2xl p-6 text-left text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <h3 className="relative text-2xl font-bold text-blue-300">
                How to Play →
              </h3>
              <p className="relative text-lg">Learn the rules here!</p>
            </Link>
          </div>

          <div className="mt-2">
            <h2 className="mb-3 text-center text-3xl font-semibold text-white">
              Private Rooms
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
              <Link
                href="/private/create"
                className="group relative flex max-w-xs flex-col gap-3 rounded-2xl p-6 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                style={{ backgroundColor: "#059669" }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <h3 className="relative text-xl font-bold text-green-300">
                  Create Private Room →
                </h3>
                <p className="relative text-lg">
                  Start a private game with friends!
                </p>
              </Link>

              <Link
                href="/private/join"
                className="group relative flex max-w-xs flex-col gap-3 rounded-2xl p-6 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                style={{ backgroundColor: "#DC2626" }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <h3 className="relative text-2xl font-bold text-pink-300">
                  Join Private Room →
                </h3>
                <p className="relative text-lg">
                  Enter a private room with a code!
                </p>
              </Link>
            </div>
          </div>

          {/* <div className="mt-4 flex flex-col items-center">
            <a
              href="https://discord.gg/Ny8Vr8zjYK"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-[#5865F2] bg-white/5 px-4 py-2 text-white shadow-sm transition-all hover:scale-105 hover:bg-[#5865F2]/20 focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 focus:outline-none"
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
          </div> */}
        </div>

        <div className="absolute right-6 bottom-4 text-sm text-white/60">
          © Copyright 2025. Developed by Anika Anne.
        </div>
      </main>
    </>
  );
}
