import { headers } from "next/headers";

export default async function PrivateRoom({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const name = "Guest";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 text-white">
      <h1 className="mb-6 text-4xl font-extrabold drop-shadow-md">
        🎧 Room <span className="text-green-500">{roomId}</span>
      </h1>

      <p className="mb-4 text-white/80">Share the code to invite friends!</p>

      <div className="mb-8 space-y-2 rounded-xl bg-white/10 p-6 shadow-md">
        <h2 className="text-xl font-semibold text-white">Players in Lobby</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white/10 px-4 py-2 text-center text-white/80">
            {name}
          </div>
        </div>
      </div>
    </main>
  );
}
