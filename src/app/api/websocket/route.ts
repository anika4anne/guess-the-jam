import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {


  return new Response("WebSocket endpoint - use external service for now", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
