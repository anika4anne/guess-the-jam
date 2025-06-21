import { PrivateRoom } from "~/components/PrivateRoom";

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <PrivateRoom roomId={roomId} />;
}
