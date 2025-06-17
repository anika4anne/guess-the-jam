interface RoomPageProps {
  params: { roomId: string };
}

export default function PrivateRoom({ params }: RoomPageProps) {
  const { roomId } = params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <h1 className="mb-6 text-4xl font-extrabold drop-shadow-md">
        🎧 Welcome to Room <span className="text-green-700">{roomId}</span>
      </h1>
      <p className="mb-10 text-lg text-white/80">
        Share this link with your friends to invite them to the game!
      </p>

      <div className="rounded-xl bg-white/10 p-6 text-center shadow-lg backdrop-blur-md">
        <p className="text-sm text-white/60">Game lobby coming soon...</p>
      </div>
    </main>
  );
}
