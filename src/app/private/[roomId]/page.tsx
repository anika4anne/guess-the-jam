import { PrivateRoom } from "~/components/PrivateRoom";

export default async function Page({ params }: { params: { roomId: string } }) {
  return <PrivateRoom roomId={params.roomId} />;
}
