import { NextResponse } from "next/server";

export async function GET(_req: Request) {
  return NextResponse.json({ error: "Spotify is no more" }, { status: 501 });
}
