"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

interface Artist {
  id: string;
  name: string;
  image: string;
  songs: string[];
  genre: string;
}

const artists: Artist[] = [
  {
    id: "1",
    name: "Taylor Swift",
    image:
      "https://www.ensembleschools.com/the-inside-voice/wp-content/uploads/sites/47/2016/11/taylore-swift-kid-appropriate-songs-to-sing.jpg",
    songs: [
      "Shake It Off",
      "Love Story",
      "Anti-Hero",
      "Blank Space",
      "You Belong With Me",
    ],
    genre: "Pop",
  },
  {
    id: "2",
    name: "Drake",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO8mIGIKONJtXjHVRvWi1-K0rIiW8KjWpc2gtroCxrUab-P7bzgSXnrAOIsDSMwXfaO1_3c5vtHrlplEwUDuAnnJggr01SOeUorWwW67k",
    songs: [
      "God's Plan",
      "One Dance",
      "Hotline Bling",
      "In My Feelings",
      "Started From The Bottom",
    ],
    genre: "Hip-Hop",
  },
  {
    id: "3",
    name: "Billie Eilish",
    image:
      "https://static01.nyt.com/images/2020/03/15/magazine/15mag-billie-03/15mag-billie-03-superJumbo-v3.jpg",
    songs: [
      "Bad Guy",
      "Lovely",
      "Happier Than Ever",
      "Therefore I Am",
      "Ocean Eyes",
    ],
    genre: "Pop",
  },
  {
    id: "4",
    name: "The Weeknd",
    image:
      "https://cdn-images.dzcdn.net/images/cover/fd00ebd6d30d7253f813dba3bb1c66a9/0x1900-000000-80-0-0.jpg",
    songs: [
      "Blinding Lights",
      "Starboy",
      "The Hills",
      "Save Your Tears",
      "Can't Feel My Face",
    ],
    genre: "Pop",
  },
  {
    id: "5",
    name: "Ariana Grande",
    image:
      "https://imageio.forbes.com/specials-images/imageserve/5ed562613dbc9800060b280b/0x0.jpg?format=jpg&crop=1080,1080,x0,y0,safe&height=416&width=416&fit=bounds",
    songs: [
      "Thank U, Next",
      "7 Rings",
      "Positions",
      "Side To Side",
      "No Tears Left To Cry",
    ],
    genre: "Pop",
  },
  {
    id: "6",
    name: "Ed Sheeran",
    image:
      "https://image.iheart.com/images/artists/39/67/90/683f1c3f4f0777c0b4c24d18.jpg?ops=fit(240%2C240)",
    songs: [
      "Shape of You",
      "Perfect",
      "Thinking Out Loud",
      "Photograph",
      "Castle on the Hill",
    ],
    genre: "Pop",
  },
  {
    id: "7",
    name: "Post Malone",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOfEBef-wEFE6bzm3tAwYrqeha9q0ZqP06qWrBCHs1BWfC8caa6-Ix5aL6p-qXbGaUVqFbJ4hz8zBEhB9_sXdjVTdWm76T6aeJlKRLPyZF",
    songs: ["Circles", "Sunflower", "Rockstar", "Better Now", "Goodbyes"],
    genre: "Hip-Hop",
  },
  {
    id: "8",
    name: "Dua Lipa",
    image:
      "data:image/jpeg;base64,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",
    songs: [
      "Levitating",
      "Don't Start Now",
      "New Rules",
      "Physical",
      "Break My Heart",
    ],
    genre: "Pop",
  },
  {
    id: "9",
    name: "Harry Styles",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcStxaR6xJAdj8b-byoWt6K8NiFUYKseuIU_qViH7tBPwayFm7QgqQ9c1qQDQUt6CiLLRed1EkLLYcN_X3urqluY4NBM29sFmOpWF59H7un5",
    songs: [
      "As It Was",
      "Watermelon Sugar",
      "Adore You",
      "Sign of the Times",
      "Late Night Talking",
    ],
    genre: "Pop",
  },
  {
    id: "10",
    name: "Olivia Rodrigo",
    image:
      "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSUGdBVQwJkxZB3djBeNOxO3YB14dkK3e2X-TNUC1AohR1DKVtubLEadYQRx4YaVChOBmz5HGFJWB4CaDmwwBzJHMv8EFsQvHue4HzKHqZXSQ",
    songs: ["Drivers License", "Good 4 U", "Deja Vu", "Traitor", "Vampire"],
    genre: "Pop",
  },
  {
    id: "11",
    name: "Bad Bunny",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQbxwplq_BcDAGNq2tZ5f1F4ZfzQJ50J-bJ4CfFxLEARn3ok9B-IwKXg2uVHtp1h9owmdfEbX7i8oCXc07Tp6AwkI9TVf25jtvZJRqueggq",
    songs: [
      "Tití Me Preguntó",
      "Moscow Mule",
      "Después de la Playa",
      "Efecto",
      "Un Coco",
    ],
    genre: "Hip-Hop",
  },
  {
    id: "12",
    name: "SZA",
    image:
      "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRp9wMrGqzaGyypGXEFowDyWrkDhAoXKoXkadFf9tBXB9Z3EN6uyHilo0Y0lLq8mgkaQuPlncUjKzf8TjhnMkd4trsIe49GJQkG_z3WwZzIRA",
    songs: ["Kill Bill", "Snooze", "Good Days", "I Hate U", "Shirt"],
    genre: "Hip-Hop",
  },
  {
    id: "13",
    name: "Kendrick Lamar",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrEJWQD6K71-M7X-86-lyr5b_PVPkYj0stg7PaVy6DPJNq9tB89hqi6ULFC0hll2wJgnsic6qYkSWDFkGYXPVI28eC-n7DidO-DOM5LtMDhQ",
    songs: ["HUMBLE.", "DNA.", "LOVE.", "Alright", "Swimming Pools"],
    genre: "Hip-Hop",
  },
  {
    id: "14",
    name: "Doja Cat",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQafl8T-6bWn9aPsAAIihbmxHKxmYn3ukMY4OGnDfNlfqBkaEHYkcSB_tbItVXBaIg3ddSEg_4ZNg7brUlHfAlISRf3BgIqU5_flJKWwwEi",
    songs: ["Say So", "Kiss Me More", "Woman", "Need to Know", "Agora Hills"],
    genre: "Hip-Hop",
  },
  {
    id: "15",
    name: "Travis Scott",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRiT4Dp_Q9irSAs9snlj9hs2ui5ZiEKj5I7hjMJ-vcTaBJL3SydErVZ5IE8aAri_SVVVld9J0IjRaqaQ6EZylm2RZkoJipOXaaoGkvzEKggIw",
    songs: [
      "SICKO MODE",
      "goosebumps",
      "Butterfly Effect",
      "Highest in the Room",
      "FE!N",
    ],
    genre: "Hip-Hop",
  },
  {
    id: "16",
    name: "BTS",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT3E4QAVJQCQ2tGGM_fuDFngZIbYAhHkoqa3y6eUuggL0GejNc9bKSkZ4nKP8Z1-v1z7kAb2z3jtPtD7NJWvMjMx992qLcM4Y9-1NzlilCG",
    songs: ["Dynamite", "Butter", "Permission to Dance", "Boy With Luv", "DNA"],
    genre: "K-Pop",
  },
  {
    id: "17",
    name: "BLACKPINK",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT3E4QAVJQCQ2tGGM_fuDFngZIbYAhHkoqa3y6eUuggL0GejNc9bKSkZ4nKP8Z1-v1z7kAb2z3jtPtD7NJWvMjMx992qLcM4Y9-1NzlilCG",
    songs: [
      "How You Like That",
      "Kill This Love",
      "DDU-DU DDU-DU",
      "Pink Venom",
      "Shut Down",
    ],
    genre: "K-Pop",
  },
  {
    id: "18",
    name: "Imagine Dragons",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bb",
    songs: ["Thunder", "Believer", "Radioactive", "Demons", "Natural"],
    genre: "Rock",
  },
  {
    id: "19",
    name: "Twenty One Pilots",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bc",
    songs: ["Stressed Out", "Heathens", "Ride", "Tear in My Heart", "Chlorine"],
    genre: "Rock",
  },
  {
    id: "21",
    name: "Shawn Mendes",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzwxtC3l-lekrGskgeU_j5HZrwep6NgLX9KjprrEJhXDlFJB1f-mKwX7HioqWJndY8qsZ5-GirNH6FCbccAXQwzIqcMRss4zczaBBpqvKy",
    songs: [
      "Stitches",
      "Treat You Better",
      "There's Nothing Holdin' Me Back",
      "Senorita",
      "Wonder",
    ],
    genre: "Pop",
  },

  {
    id: "22",
    name: "Justin Bieber",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxEbyirutCd9BDb_OhURtDwTM5L1OIB5coXrDeCC9JiBboNwOHAYIluUAAm7aRFfAflGAYE-pXLO7dv3IsU3uGHDQ_rTRPtuHWPbt_NVbXIg",
    songs: ["Sorry", "Love Yourself", "Peaches", "Stay", "Ghost"],
    genre: "Pop",
  },
  {
    id: "23",
    name: "Adele",
    image:
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSkdp3pjOO1gHyZ9pRxWvC9tqRx8chuOrQctEoBGfidCE2zaT--92VXN0QPEGUx4yF0S2KnC1h3-_pEaxriQ0bL3BHPiqvGvpklfahlW-jr",
    songs: [
      "Hello",
      "Easy On Me",
      "Someone Like You",
      "Rolling in the Deep",
      "Set Fire to the Rain",
    ],
    genre: "Pop",
  },
  {
    id: "24",
    name: "Bruno Mars",
    image:
      "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcTjqEv0gYy4R3E6ApE1ICJLMl_4-u5bBDkXC23ayTuADUtUI-wUebh9cIazDKvwO3td1dfoL5mDoEGoKlizoZjwvZhxH8CrPhSA4YGrGqbT7pNyCvFBVL81T171-y5it3_qZf4I3fP95ns",
    songs: [
      "Uptown Funk",
      "24K Magic",
      "That's What I Like",
      "Grenade",
      "Just The Way You Are",
    ],
    genre: "Pop",
  },

  {
    id: "25",
    name: "Kanye West",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT3E4QAVJQCQ2tGGM_fuDFngZIbYAhHkoqa3y6eUuggL0GejNc9bKSkZ4nKP8Z1-v1z7kAb2z3jtPtD7NJWvMjMx992qLcM4Y9-1NzlilCG",
    songs: [
      "Stronger",
      "Gold Digger",
      "Heartless",
      "All of the Lights",
      "Runaway",
    ],
    genre: "Hip-Hop",
  },
  {
    id: "26",
    name: "Eminem",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT3E4QAVJQCQ2tGGM_fuDFngZIbYAhHkoqa3y6eUuggL0GejNc9bKSkZ4nKP8Z1-v1z7kAb2z3jtPtD7NJWvMjMx992qLcM4Y9-1NzlilCG",
    songs: [
      "Lose Yourself",
      "Not Afraid",
      "Love The Way You Lie",
      "Rap God",
      "Stan",
    ],
    genre: "Hip-Hop",
  },

  {
    id: "28",
    name: "The Weeknd",
    image:
      "https://cdn-images.dzcdn.net/images/cover/fd00ebd6d30d7253f813dba3bb1c66a9/0x1900-000000-80-0-0.jpg",
    songs: [
      "Blinding Lights",
      "Starboy",
      "The Hills",
      "Save Your Tears",
      "After Hours",
    ],
    genre: "Pop",
  },
  {
    id: "29",
    name: "Tame Impala",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bm",
    songs: [
      "The Less I Know The Better",
      "Let It Happen",
      "Borderline",
      "Feels Like We Only Go Backwards",
      "Elephant",
    ],
    genre: "Pop",
  },
  {
    id: "30",
    name: "Arctic Monkeys",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bn",
    songs: [
      "Do I Wanna Know?",
      "505",
      "I Bet You Look Good On The Dancefloor",
      "Arabella",
      "R U Mine?",
    ],
    genre: "Pop",
  },

  {
    id: "31",
    name: "TWICE",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT3E4QAVJQCQ2tGGM_fuDFngZIbYAhHkoqa3y6eUuggL0GejNc9bKSkZ4nKP8Z1-v1z7kAb2z3jtPtD7NJWvMjMx992qLcM4Y9-1NzlilCG",
    songs: [
      "Fancy",
      "Feel Special",
      "The Feels",
      "I Can't Stop Me",
      "Scientist",
    ],
    genre: "K-Pop",
  },
  {
    id: "32",
    name: "NewJeans",
    image:
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcT2sKPYq6-V0gHkz88N7HBHDs6gneJ8LAIsDvu9ZPzB93F4Dw5thlaQRgVGGOkfE23I7KlUDDOnwqVebsSiqBVseTPpXlw5qxES6vbYPZ9Dwg",
    songs: ["Attention", "Hype Boy", "OMG", "Ditto", "Get Up"],
    genre: "K-Pop",
  },
  {
    id: "33",
    name: "Stray Kids",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT3E4QAVJQCQ2tGGM_fuDFngZIbYAhHkoqa3y6eUuggL0GejNc9bKSkZ4nKP8Z1-v1z7kAb2z3jtPtD7NJWvMjMx992qLcM4Y9-1NzlilCG",
    songs: ["God's Menu", "Thunderous", "Maniac", "Case 143", "S-Class"],
    genre: "K-Pop",
  },

  {
    id: "34",
    name: "Foo Fighters",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0br",
    songs: [
      "Everlong",
      "The Pretender",
      "Learn to Fly",
      "Best of You",
      "Times Like These",
    ],
    genre: "Rock",
  },
  {
    id: "35",
    name: "Green Day",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bs",
    songs: [
      "American Idiot",
      "Basket Case",
      "Good Riddance",
      "Boulevard of Broken Dreams",
      "Wake Me Up When September Ends",
    ],
    genre: "Rock",
  },
  {
    id: "36",
    name: "Red Hot Chili Peppers",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bt",
    songs: [
      "Californication",
      "Under the Bridge",
      "Scar Tissue",
      "By the Way",
      "Dani California",
    ],
    genre: "Rock",
  },

  {
    id: "37",
    name: "Morgan Wallen",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bu",
    songs: [
      "Whiskey Glasses",
      "7 Summers",
      "Wasted on You",
      "You Proof",
      "Thought You Should Know",
    ],
    genre: "Pop",
  },
  {
    id: "38",
    name: "Maren Morris",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bv",
    songs: ["The Middle", "My Church", "80s Mercedes", "Rich", "Girl"],
    genre: "Pop",
  },
  {
    id: "39",
    name: "Kane Brown",
    image: "https://i.scdn.co/image/ab6761610000e5eb8c2336e6c8d0b5b0b0b0b0bw",
    songs: [
      "What Ifs",
      "Heaven",
      "Good as You",
      "One Thing Right",
      "Be Like That",
    ],
    genre: "Pop",
  },
];

export default function PickArtistPage() {
  const router = useRouter();
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [currentSong, setCurrentSong] = useState<string>("");
  const [userGuess, setUserGuess] = useState<string>("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gamePhase, setGamePhase] = useState<
    "select" | "playing" | "result" | "complete"
  >("select");
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [showAllArtists, setShowAllArtists] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const genres = ["All", "Pop", "Hip-Hop", "K-Pop"];

  const filteredArtists =
    selectedGenre === "All"
      ? artists
      : artists.filter((artist) => artist.genre === selectedGenre);

  const displayedArtists = showAllArtists
    ? filteredArtists
    : filteredArtists.slice(0, 12);

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtists((prev) => {
      if (prev.includes(artistId)) {
        return prev.filter((id) => id !== artistId);
      } else {
        return [...prev, artistId];
      }
    });
  };

  const startGame = () => {
    if (selectedArtists.length === 0) return;

    setGamePhase("playing");
    setRound(1);
    setScore(0);
    setTotalRounds(10);
    startNewRound();
  };

  const startNewRound = () => {
    const availableArtists = artists.filter((artist) =>
      selectedArtists.includes(artist.id),
    );
    if (availableArtists.length === 0) return;

    const randomArtist =
      availableArtists[Math.floor(Math.random() * availableArtists.length)];
    if (!randomArtist) return;

    const randomSong =
      randomArtist.songs[Math.floor(Math.random() * randomArtist.songs.length)];
    if (!randomSong) return;

    // Generate multiple choice options (correct answer + 3 wrong answers)
    const correctAnswer = randomArtist.name;
    const wrongAnswers = artists
      .filter((artist) => artist.id !== randomArtist.id)
      .map((artist) => artist.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...wrongAnswers].sort(
      () => Math.random() - 0.5,
    );

    setCurrentArtist(randomArtist);
    setCurrentSong(randomSong);
    setAnswerOptions(allOptions);
    setUserGuess("");
    setTimeLeft(30);
    setGamePhase("playing");

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCorrect(false);
    setGamePhase("result");
  };

  const handleSubmit = (selectedArtist: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const isCorrectGuess = selectedArtist === currentArtist?.name;
    setIsCorrect(isCorrectGuess);
    setUserGuess(selectedArtist);

    if (isCorrectGuess) {
      setScore((prev) => prev + 10);
    }

    setGamePhase("result");
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      setGamePhase("complete");
      return;
    }

    setRound((prev) => prev + 1);
    startNewRound();
  };

  const resetGame = () => {
    setGamePhase("select");
    setSelectedArtists([]);
    setScore(0);
    setRound(1);
    setUserGuess("");
    setCurrentArtist(null);
    setCurrentSong("");
    setAnswerOptions([]);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (gamePhase === "select") {
    return (
      <main className="pick-artist-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
        <div className="absolute top-6 left-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            ← Back to Home
          </Button>
        </div>

        <h1 className="mb-8 text-4xl font-bold text-pink-300">
          Pick Your Artists
        </h1>

        <div className="w-full max-w-4xl rounded-2xl bg-white/10 p-8 shadow-lg backdrop-blur-md">
          <p className="mb-6 text-center text-lg text-white/80">
            Choose at least 2 artists. We&apos;ll play their songs and you guess
            who it is.
          </p>

          <div className="mb-6">
            <h3 className="mb-3 text-center text-lg font-semibold text-white">
              Filter by Genre:
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre);
                    setShowAllArtists(false);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedGenre === genre
                      ? "bg-pink-500 text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {displayedArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleArtistSelect(artist.id)}
                className={`cursor-pointer rounded-xl p-4 transition-all ${
                  selectedArtists.includes(artist.id)
                    ? "bg-pink-500 ring-2 ring-pink-300"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <div className="text-center">
                  <div className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-full">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-white">{artist.name}</h3>
                </div>
              </div>
            ))}
          </div>

          {filteredArtists.length > 0 && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => setShowAllArtists(!showAllArtists)}
                className="bg-white/10 px-6 py-2 text-base font-semibold text-white hover:bg-white/20"
              >
                {showAllArtists
                  ? "Show Less"
                  : `View More (${Math.max(0, filteredArtists.length - 12)} more)`}
              </Button>
            </div>
          )}

          <div className="mt-8 space-y-6 text-center">
            <Button
              onClick={() => {
                const shuffled = [...filteredArtists].sort(
                  () => Math.random() - 0.5,
                );
                const randomCount = Math.floor(Math.random() * 4) + 2; // 2-5 artists
                setSelectedArtists(
                  shuffled.slice(0, randomCount).map((a) => a.id),
                );
              }}
              className="bg-purple-600 px-6 py-2 text-base font-semibold text-white hover:bg-purple-700"
            >
              Surprise Me
            </Button>
            <Button
              onClick={startGame}
              disabled={selectedArtists.length === 0}
              className={`px-8 py-3 text-lg font-semibold ${
                selectedArtists.length === 0
                  ? "cursor-not-allowed bg-gray-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Let&apos;s Go! ({selectedArtists.length} artist
              {selectedArtists.length !== 1 ? "s" : ""} picked)
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (gamePhase === "complete") {
    return (
      <main className="pick-artist-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
        <div className="w-full max-w-2xl rounded-2xl bg-white/10 p-8 text-center shadow-lg backdrop-blur-md">
          <h1 className="mb-6 text-4xl font-bold text-pink-300">Game Over</h1>
          <p className="mb-4 text-2xl text-white">
            You scored{" "}
            <span className="font-bold text-yellow-400">{score}</span> points
          </p>
          <p className="mb-8 text-lg text-white/80">
            {score >= 8
              ? "You know your music!"
              : score >= 6
                ? "Not bad at all"
                : score >= 4
                  ? "Keep trying"
                  : "Better luck next time"}
          </p>

          <div className="space-y-4">
            <Button
              onClick={resetGame}
              className="w-full bg-green-600 py-3 text-lg font-semibold text-white hover:bg-green-700"
            >
              Try Again
            </Button>
            <Button
              onClick={handleBack}
              className="w-full bg-gray-600 py-3 text-lg font-semibold text-white hover:bg-gray-700"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pick-artist-background flex min-h-screen flex-col items-center justify-center px-6 text-white">
      <div className="absolute top-6 left-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          ← Back to Home
        </Button>
      </div>

      <div className="w-full max-w-2xl rounded-2xl bg-white/10 p-8 shadow-lg backdrop-blur-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-pink-300">Artist Challenge</h1>
          <div className="text-right">
            <p className="text-white">
              Round {round} of {totalRounds}
            </p>
            <p className="font-bold text-yellow-400">Score: {score}</p>
          </div>
        </div>

        {gamePhase === "playing" && (
          <>
            <div className="mb-6 text-center">
              <h2 className="mb-4 text-xl text-white">Who sings this?</h2>
              <p className="mb-4 text-3xl font-bold text-pink-300">
                {currentSong}
              </p>
              <div className="mb-4">
                <div className="mb-2 text-lg text-white">Time: {timeLeft}s</div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {answerOptions.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleSubmit(option)}
                  className="bg-white/10 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-pink-500 hover:text-white"
                >
                  {option}
                </Button>
              ))}
            </div>
          </>
        )}

        {gamePhase === "result" && (
          <div className="text-center">
            <div className="mb-6">
              <h2 className="mb-4 text-2xl font-bold">
                {isCorrect ? "Nice!" : "Wrong"}
              </h2>
              <p className="mb-2 text-lg text-white">
                Song:{" "}
                <span className="font-bold text-pink-300">
                  &quot;{currentSong}&quot;
                </span>
              </p>
              <p className="mb-2 text-lg text-white">
                Artist:{" "}
                <span className="font-bold text-yellow-400">
                  {currentArtist?.name}
                </span>
              </p>
              <p className="text-lg text-white">
                You guessed:{" "}
                <span
                  className={`font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}
                >
                  {userGuess}
                </span>
              </p>
              {isCorrect && (
                <p className="mt-2 font-bold text-green-400">+10 points!</p>
              )}
            </div>

            <Button
              onClick={nextRound}
              className="bg-green-600 px-8 py-3 text-lg font-semibold text-white hover:bg-green-700"
            >
              {round >= totalRounds ? "See Results" : "Next Song"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
