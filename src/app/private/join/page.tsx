import JoinPrivateRoomClientPage from "./clientPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ roomId: string | null }>;
}) {
  const { roomId } = await searchParams;
  return <JoinPrivateRoomClientPage roomId={roomId} />;
}
