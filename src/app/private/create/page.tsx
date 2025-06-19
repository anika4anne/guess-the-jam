"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "~/components/ui/button";

export default function CreatePrivateRoom() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) {
      setShowError(true);
      return;
    }

    const newRoomId = uuidv4().split("-")[0];

    const storageKey = `room-${newRoomId}-players`;
    localStorage.setItem(storageKey, JSON.stringify([name.trim()]));

    router.push(
      `/private/${newRoomId}?name=${encodeURIComponent(name.trim())}`,
    );
  };

  const handleBack = () => {
    router.push("/private");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    }
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
          ← Back
        </Button>
      </div>

      <h1 className="mb-6 text-4xl font-extrabold drop-shadow-md">
        🎶 Create a Private Room
      </h1>

      <div className="animated-border relative mb-4 w-80 rounded-lg">
        <div className="input-wrapper rounded-md bg-black/70 px-4 py-2">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setShowError(false);
            }}
            onKeyPress={handleKeyPress}
            className="w-full bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <button
        onClick={handleCreate}
        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
      >
        Create Private Room
      </button>

      {/* Error Popup */}
      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg bg-white p-6 text-center">
            <div className="mb-4 text-4xl text-red-500">⚠️</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Name Required
            </h3>
            <p className="mb-4 text-gray-600">
              Please enter your name to create a room.
            </p>
            <Button
              onClick={() => setShowError(false)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              OK
            </Button>
          </div>
        </div>
      )}

      <style jsx>{`
        .animated-border {
          --borderWidth: 4px;
          padding: var(--borderWidth);
          border-radius: 0.5rem;
          background: linear-gradient(
            270deg,
            #0080ff,
            #8000ff,
            #ff0080,
            #8000ff,
            #0080ff
          );
          background-size: 400% 400%;
          animation: gradientMove 8s ease infinite;
          display: inline-block;
        }

        .input-wrapper {
          border-radius: 0.375rem;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </main>
  );
}
