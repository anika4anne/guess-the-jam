"use client";

import { useRouter } from "next/navigation";

export default function CreatePrivateRoomPage() {
  const router = useRouter();

  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    router.push(`/private/${roomId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 text-white">
      <h1 className="text-5xl font-extrabold drop-shadow-lg">
        Create Your Private Game Room
      </h1>

      <p className="max-w-xl text-center text-lg text-white/80">
        Invite your friends by sharing the room link — only you control who
        joins!
      </p>

      <button
        onClick={handleCreateRoom}
        className="rounded-full bg-green-500 px-10 py-4 text-2xl font-bold shadow-lg transition hover:bg-green-600"
      >
        Create Private Room
      </button>

      <button
        onClick={() => router.back()}
        className="mt-6 rounded-full border border-white/60 px-8 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
      >
        ← Back
      </button>
    </main>
  );
}
