import { NextResponse } from "next/server";

const sampleSongs: Record<number, Array<{ title: string; artist: string }>> = {
  2024: [
    { title: "Flowers", artist: "Miley Cyrus" },
    { title: "Vampire", artist: "Olivia Rodrigo" },
    { title: "Kill Bill", artist: "SZA" },
    { title: "Anti-Hero", artist: "Taylor Swift" },
  ],
  2023: [
    { title: "Flowers", artist: "Miley Cyrus" },
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
    { title: "Blinding Lights", artist: "The Weeknd" },
  ],
  2020: [
    { title: "Blinding Lights", artist: "The Weeknd" },
    { title: "Dance Monkey", artist: "Tones and I" },
    { title: "The Box", artist: "Roddy Ricch" },
    { title: "Circles", artist: "Post Malone" },
  ],
  2010: [
    { title: "Tik Tok", artist: "Kesha" },
    { title: "Need You Now", artist: "Lady Antebellum" },
    { title: "Hey, Soul Sister", artist: "Train" },
    { title: "California Gurls", artist: "Katy Perry" },
    { title: "Rolling in the Deep", artist: "Adele" },
  ],
  2011: [
    { title: "Rolling in the Deep", artist: "Adele" },
    { title: "Party Rock Anthem", artist: "LMFAO" },
    { title: "Firework", artist: "Katy Perry" },
    { title: "E.T.", artist: "Katy Perry" },
    { title: "Grenade", artist: "Bruno Mars" },
  ],
  2012: [
    { title: "Somebody That I Used to Know", artist: "Gotye" },
    { title: "Call Me Maybe", artist: "Carly Rae Jepsen" },
    { title: "We Are Young", artist: "Fun." },
    { title: "Payphone", artist: "Maroon 5" },
    { title: "One More Night", artist: "Maroon 5" },
  ],
  2013: [
    { title: "Thrift Shop", artist: "Macklemore & Ryan Lewis" },
    { title: "Blurred Lines", artist: "Robin Thicke" },
    { title: "Radioactive", artist: "Imagine Dragons" },
    { title: "Stay With Me", artist: "Sam Smith" },
    { title: "Royals", artist: "Lorde" },
  ],
  2014: [
    { title: "Happy", artist: "Pharrell Williams" },
    { title: "All of Me", artist: "John Legend" },
    { title: "Shake It Off", artist: "Taylor Swift" },
    { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
    { title: "Blank Space", artist: "Taylor Swift" },
  ],
  2015: [
    { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
    { title: "See You Again", artist: "Wiz Khalifa ft. Charlie Puth" },
    { title: "Hello", artist: "Adele" },
    { title: "Sorry", artist: "Justin Bieber" },
    { title: "Love Yourself", artist: "Justin Bieber" },
  ],
  2016: [
    { title: "Hello", artist: "Adele" },
    { title: "Closer", artist: "The Chainsmokers ft. Halsey" },
    { title: "Stressed Out", artist: "Twenty One Pilots" },
    { title: "One Dance", artist: "Drake" },
    { title: "Cheap Thrills", artist: "Sia ft. Sean Paul" },
  ],
  2017: [
    { title: "Shape of You", artist: "Ed Sheeran" },
    { title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee" },
    { title: "That's What I Like", artist: "Bruno Mars" },
    { title: "Humble", artist: "Kendrick Lamar" },
    { title: "Stay", artist: "Zedd & Alessia Cara" },
  ],
  2018: [
    { title: "God's Plan", artist: "Drake" },
    { title: "Perfect", artist: "Ed Sheeran" },
    { title: "Finesse", artist: "Bruno Mars ft. Cardi B" },
  ],
  2019: [
    { title: "Old Town Road", artist: "Lil Nas X ft. Billy Ray Cyrus" },
    { title: "Bad Guy", artist: "Billie Eilish" },
    { title: "Señorita", artist: "Shawn Mendes & Camila Cabello" },
    { title: "Truth Hurts", artist: "Lizzo" },
    { title: "Sunflower", artist: "Post Malone & Swae Lee" },
  ],
  2009: [
    { title: "Boom Boom Pow", artist: "The Black Eyed Peas" },
    { title: "Poker Face", artist: "Lady Gaga" },
    { title: "Just Dance", artist: "Lady Gaga" },
    { title: "I Gotta Feeling", artist: "The Black Eyed Peas" },
    { title: "Love Story", artist: "Taylor Swift" },
  ],
  2008: [
    { title: "Low", artist: "Flo Rida" },
    { title: "Bleeding Love", artist: "Leona Lewis" },
    { title: "Viva la Vida", artist: "Coldplay" },
    { title: "Single Ladies", artist: "Beyoncé" },
    { title: "So What", artist: "Pink" },
  ],
  2007: [
    { title: "Umbrella", artist: "Rihanna" },
    { title: "Irreplaceable", artist: "Beyoncé" },
    { title: "The Way I Are", artist: "Timbaland" },
    { title: "Big Girls Don't Cry", artist: "Fergie" },
    { title: "Beautiful Girls", artist: "Sean Kingston" },
  ],
  2006: [
    { title: "Bad Day", artist: "Daniel Powter" },
    { title: "Temperature", artist: "Sean Paul" },
    { title: "Promiscuous", artist: "Nelly Furtado" },
    { title: "Hips Don't Lie", artist: "Shakira" },
    { title: "Crazy", artist: "Gnarls Barkley" },
  ],
  2005: [
    { title: "We Belong Together", artist: "Mariah Carey" },
    { title: "Hollaback Girl", artist: "Gwen Stefani" },
    { title: "Since U Been Gone", artist: "Kelly Clarkson" },
    { title: "Gold Digger", artist: "Kanye West" },
  ],
  2004: [
    { title: "Yeah!", artist: "Usher" },
    { title: "This Love", artist: "Maroon 5" },
    { title: "Hey Ya!", artist: "OutKast" },
    { title: "Toxic", artist: "Britney Spears" },
    { title: "The Reason", artist: "Hoobastank" },
  ],
  2003: [
    { title: "In da Club", artist: "50 Cent" },
    { title: "Get Busy", artist: "Sean Paul" },
    { title: "Crazy in Love", artist: "Beyoncé" },
    { title: "Where Is the Love?", artist: "The Black Eyed Peas" },
    { title: "Clocks", artist: "Coldplay" },
  ],
  2002: [
    { title: "A Thousand Miles", artist: "Vanessa Carlton" },
    { title: "Hot in Herre", artist: "Nelly" },
    { title: "Dilemma", artist: "Nelly" },
    { title: "Complicated", artist: "Avril Lavigne" },
    { title: "Without Me", artist: "Eminem" },
  ],
  2001: [
    { title: "Hanging by a Moment", artist: "Lifehouse" },
    { title: "Fallin'", artist: "Alicia Keys" },
    { title: "All for You", artist: "Janet Jackson" },
    { title: "Drops of Jupiter", artist: "Train" },
    { title: "It's Been Awhile", artist: "Staind" },
  ],
  2000: [
    { title: "Breathe", artist: "Faith Hill" },
    { title: "Say My Name", artist: "Destiny's Child" },
    { title: "I Wanna Know", artist: "Joe" },
    { title: "Everything You Want", artist: "Vertical Horizon" },
    { title: "Try Again", artist: "Aaliyah" },
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
