import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { roomId, event, data, secret } = await request.json();

    const expectedSecret = process.env.WEBHOOK_SECRET ?? "your-secret-key";
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!roomId || !event) {
      return NextResponse.json(
        { error: "Missing required fields: roomId, event" },
        { status: 400 },
      );
    }

    console.log(`🔗 Webhook received for room ${roomId}:`, event, data);

    console.log(
      `📡 Webhook event '${event}' triggered for room ${roomId}:`,
      data,
    );

    return NextResponse.json({
      success: true,
      message: `Webhook event '${event}' processed for room ${roomId}`,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json(
      { error: "Missing roomId parameter" },
      { status: 400 },
    );
  }

  try {
    const roomInfo = {
      id: roomId,
      status: "active",
      playerCount: 2,
      gamePhase: "waiting",
    };

    return NextResponse.json({ roomInfo });
  } catch (error) {
    console.error("Error getting room info:", error);
    return NextResponse.json(
      { error: "Failed to get room info" },
      { status: 500 },
    );
  }
}
