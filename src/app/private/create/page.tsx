"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function CreatePrivateRoom() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    const newRoomId = uuidv4().split("-")[0];
    router.push(`/private/${newRoomId}?name=${encodeURIComponent(name)}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] px-6 text-white">
      <h1 className="mb-6 text-4xl font-extrabold drop-shadow-md">
        🎶 Create a Private Room
      </h1>

      <div className="animated-border relative mb-4 w-80 rounded-lg">
        <div className="input-wrapper rounded-md bg-black/70 px-4 py-2">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
