import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  // This is a placeholder for WebSocket upgrade
  // Vercel Edge Functions don't support WebSocket upgrades directly
  // We'll need to use a different approach

  return new Response("WebSocket endpoint - use external service for now", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
