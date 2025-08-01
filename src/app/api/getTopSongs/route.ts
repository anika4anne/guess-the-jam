import { NextResponse } from "next/server";

// Sample song data for different years
const sampleSongs: Record<number, Array<{ title: string; artist: string }>> = {
  2024: [
    { title: "Flowers", artist: "Miley Cyrus" },
    { title: "Last Night", artist: "Morgan Wallen" },
    { title: "Vampire", artist: "Olivia Rodrigo" },
    { title: "Kill Bill", artist: "SZA" },
    { title: "Anti-Hero", artist: "Taylor Swift" },
  ],
  2023: [
    { title: "Flowers", artist: "Miley Cyrus" },
    { title: "Last Night", artist: "Morgan Wallen" },
    { title: "Vampire", artist: "Olivia Rodrigo" },
    { title: "Kill Bill", artist: "SZA" },
    { title: "Anti-Hero", artist: "Taylor Swift" },
  ],
  2022: [
    { title: "As It Was", artist: "Harry Styles" },
    { title: "About Damn Time", artist: "Lizzo" },
    { title: "Late Night Talking", artist: "Harry Styles" },
    { title: "Hold Me Closer", artist: "Elton John, Britney Spears" },
    { title: "Break My Soul", artist: "Beyoncé" },
  ],
  2021: [
    { title: "drivers license", artist: "Olivia Rodrigo" },
    { title: "good 4 u", artist: "Olivia Rodrigo" },
    { title: "deja vu", artist: "Olivia Rodrigo" },
    { title: "Levitating", artist: "Dua Lipa" },
    { title: "Blinding Lights", artist: "The Weeknd" },
  ],
  2020: [
    { title: "Blinding Lights", artist: "The Weeknd" },
    { title: "Dance Monkey", artist: "Tones and I" },
    { title: "The Box", artist: "Roddy Ricch" },
    { title: "Don't Start Now", artist: "Dua Lipa" },
    { title: "Circles", artist: "Post Malone" },
  ],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearsParam = searchParams.get("years");

    if (!yearsParam) {
      return NextResponse.json(
        { error: "Years parameter is required" },
        { status: 400 },
      );
    }

    const years = yearsParam
      .split(",")
      .map((y) => parseInt(y, 10))
      .filter((y) => !isNaN(y));

    if (years.length === 0) {
      return NextResponse.json(
        { error: "No valid years provided" },
        { status: 400 },
      );
    }

    // Combine songs from all requested years
    const allSongs: Array<{ title: string; artist: string }> = [];
    years.forEach((year) => {
      if (sampleSongs[year]) {
        allSongs.push(...sampleSongs[year]);
      }
    });

    if (allSongs.length === 0) {
      return NextResponse.json(
        { error: "No songs found for the specified years" },
        { status: 404 },
      );
    }

    return NextResponse.json(allSongs);
  } catch (error) {
    console.error("Error in getTopSongs API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
