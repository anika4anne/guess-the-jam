import { NextResponse } from "next/server";

// Define types for the response data
interface Track {
  name: string;
  artist: string;
  preview_url: string;
  spotify_url: string;
  image: string;
}

interface TrackSearchResponse {
  items: {
    track?: {
      name: string;
      artists: { name: string }[];
      preview_url: string;
      external_urls: { spotify: string };
      album: { images: { url: string }[] };
    };
  }[];
}

// Map of year to Spotify playlist IDs
const playlistMap: Record<string, string> = {
  "2024": "0NtZx6ZDoPupjxqGQ6yylo",
  // You can add more years and playlists here
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

    // Find playlist ID for the requested year
    const playlistId = playlistMap[year];
    if (!playlistId) {
      return NextResponse.json(
        { error: `No playlist found for year ${year}` },
        { status: 404 },
      );
    }

    // Step 1: Get Spotify access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Step 2: Get tracks from the specified playlist
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const tracksData: TrackSearchResponse = await tracksRes.json();

    const tracks: Track[] = tracksData.items
      .map((item) => ({
        name: item.track?.name || "Unknown Track",
        artist: item.track?.artists?.[0]?.name || "Unknown Artist",
        preview_url: item.track?.preview_url || "",
        spotify_url: item.track?.external_urls?.spotify || "",
        image: item.track?.album?.images?.[0]?.url || "",
      }))
      .filter((t) => t.preview_url); // Only keep tracks with a preview URL

    // Shuffle tracks randomly
    const shuffled = tracks.sort(() => 0.5 - Math.random());

    return NextResponse.json(shuffled.slice(0, 10)); // Return 10 songs
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Something went wrong", details: error.message },
        { status: 500 },
      );
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 },
      );
    }
  }
}
