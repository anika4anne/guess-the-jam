import { NextResponse } from "next/server";

interface PlaylistSong {
  title: string;
  artist: string;
  videoId: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get("playlistId");

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID parameter is required" },
        { status: 400 },
      );
    }

    const mockPlaylistSongs: PlaylistSong[] = [
      { title: "Song 1", artist: "Artist 1", videoId: "dQw4w9WgXcQ" },
      { title: "Song 2", artist: "Artist 2", videoId: "dQw4w9WgXcQ" },
      { title: "Song 3", artist: "Artist 3", videoId: "dQw4w9WgXcQ" },
      { title: "Song 4", artist: "Artist 4", videoId: "dQw4w9WgXcQ" },
      { title: "Song 5", artist: "Artist 5", videoId: "dQw4w9WgXcQ" },
    ];

    const songs = mockPlaylistSongs.map((song) => ({
      title: song.title,
      artist: song.artist,
    }));

    if (songs.length === 0) {
      return NextResponse.json(
        { error: "No songs found in the playlist" },
        { status: 404 },
      );
    }

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error in getPlaylistSongs API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
