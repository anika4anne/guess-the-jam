import { PrivateRoom } from "~/components/PrivateRoom";
import PlayNowClientPage from "./clientPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ roomId: string | null; name: string | null }>;
}) {
  const { roomId, name } = await searchParams;
  return <PlayNowClientPage roomId={roomId} name={name} />;
}
