import { NextResponse } from "next/server";

// Define expected structures
interface SpotifyTrack {
  name: string;
  artist: string;
  preview_url: string;
  spotify_url: string;
  image: string;
}

interface SpotifyApiTrackItem {
  track?: {
    name?: string;
    artists?: { name?: string }[];
    preview_url?: string;
    external_urls?: { spotify?: string };
    album?: { images?: { url: string }[] };
  };
}

interface SpotifyApiTrackResponse {
  items: SpotifyApiTrackItem[];
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Year → Playlist ID
const playlistMap: Record<string, string> = {
  "2024": "0NtZx6ZDoPupjxqGQ6yylo",
};

const clientId = process.env.SPOTIFY_CLIENT_ID!;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");

    if (!year) {
      return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    const playlistId = playlistMap[year];
    if (!playlistId) {
      return NextResponse.json(
        { error: `No playlist found for year ${year}` },
        { status: 404 },
      );
    }

    // Step 1: Get token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenJson: unknown = await tokenRes.json();

    if (
      typeof tokenJson !== "object" ||
      tokenJson === null ||
      !("access_token" in tokenJson)
    ) {
      return NextResponse.json(
        { error: "Invalid token response" },
        { status: 500 },
      );
    }

    const accessToken = (tokenJson as SpotifyTokenResponse).access_token;

    // Step 2: Fetch playlist tracks
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const tracksJson: unknown = await tracksRes.json();
    if (
      typeof tracksJson !== "object" ||
      tracksJson === null ||
      !("items" in tracksJson)
    ) {
      return NextResponse.json(
        { error: "Invalid tracks response" },
        { status: 500 },
      );
    }

    const items = (tracksJson as SpotifyApiTrackResponse).items;

    const formattedTracks: SpotifyTrack[] = items
      .map(
        (item): SpotifyTrack => ({
          name: item.track?.name ?? "Unknown Track",
          artist: item.track?.artists?.[0]?.name ?? "Unknown Artist",
          preview_url: item.track?.preview_url ?? "",
          spotify_url: item.track?.external_urls?.spotify ?? "",
          image: item.track?.album?.images?.[0]?.url ?? "",
        }),
      )
      .filter((track) => track.preview_url !== "");

    const shuffled = [...formattedTracks].sort(() => 0.5 - Math.random());
    return NextResponse.json(shuffled.slice(0, 10));
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
