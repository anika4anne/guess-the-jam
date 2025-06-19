"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function PrivatePage() {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/private/create");
  };

  const handleJoin = () => {
    router.push("/private/join");
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] px-6 text-white">
      {/* Back Button */}
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
        🎧 Private Rooms
      </h1>

      <div className="space-y-6 rounded-2xl bg-white/10 p-8 text-center shadow-lg backdrop-blur-md">
        <p className="mb-6 text-lg text-white/80">
          Create a private room or join an existing one with friends!
        </p>

        <div className="space-y-4">
          <Button
            onClick={handleCreate}
            className="w-full bg-green-600 py-4 text-lg font-semibold text-white hover:bg-green-700"
          >
            🎶 Create New Room
          </Button>

          <Button
            onClick={handleJoin}
            className="w-full bg-pink-500 py-4 text-lg font-semibold text-white hover:bg-pink-600"
          >
            🎉 Join Existing Room
          </Button>
        </div>
      </div>
    </main>
  );
}
