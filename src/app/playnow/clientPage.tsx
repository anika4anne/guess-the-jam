"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
// import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface Song {
  title: string;
  artist: string;
}

interface YouTubePlayer extends YT.Player {
  __intervalAttached?: boolean;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function PlayNowPage() {
  const router = useRouter();
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [errorIndexes, setErrorIndexes] = useState<number[]>([]);
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);
  const [volumeUnmuted, setVolumeUnmuted] = useState(false);

  // coutdown things
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);

  // fading
  const [fadeCountdown, setFadeCountdown] = useState(false);
  const iframeRefs = useRef<Record<number, HTMLIFrameElement | null>>({});

  const [currentQuestionYear, setCurrentQuestionYear] = useState<number | null>(
    null,
  );
  const [showPrompt, setShowPrompt] = useState(false);
  const [userSongAnswer, setUserSongAnswer] = useState("");
  const [userArtistAnswer, setUserArtistAnswer] = useState("");
  const [currentSong, setCurrentSong] = useState("");
  const [currentArtist, setCurrentArtist] = useState("");
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const playerRefs = useRef<Record<number, YouTubePlayer | null>>({});

  const intervalRefs = useRef<Record<number, NodeJS.Timeout | null>>({});
  const [index] = useState(Math.floor(Math.random() * 80));

  // Add visualizerTime state for animation
  const [visualizerTime, setVisualizerTime] = useState(0);
  // Store random phase offsets for each line
  const visualizerPhases = useRef(
    Array.from({ length: 48 }, () => Math.random() * Math.PI * 2),
  );

  const fetchTopSongs = async (years: number[]) => {
    try {
      const res = await fetch(`/api/getTopSongs?years=${years.join(",")}`);
      const data = (await res.json()) as Song[];
      setSongs(data);

      // countdown before showing songs
      setShowCountdown(true);
      setShowYouTubePlayer(false);
      setCountdownNumber(3);
      setFadeCountdown(false);
    } catch (error) {
      console.error("Error fetching top songs:", error);
    }
  };

  // fading out after countdown
  useEffect(() => {
    if (!showCountdown) return;

    if (countdownNumber === 0 && !fadeCountdown) {
      setFadeCountdown(true);
      return;
    }

    if (fadeCountdown) {
      const timeout = setTimeout(() => {
        setShowCountdown(false);
        setShowYouTubePlayer(true);
        setFadeCountdown(false);
      }, 500); // fade duration

      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setCountdownNumber((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownNumber, showCountdown, fadeCountdown]);

  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API is ready");
    };
  }, []);

  useEffect(() => {
    if (!window.YT || !showYouTubePlayer) return;

    // Store the current refs at the start of the effect
    const currentIntervalRefs = { ...intervalRefs.current };

    selectedYears.forEach((year) => {
      const iframe = iframeRefs.current[year];
      if (!iframe) return;

      playerRefs.current[year] = new window.YT.Player(iframe, {
        height: "0",
        width: "0",
        events: {
          onReady: () => {
            console.log(`YouTube Player for year ${year} is ready`);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            const player = playerRefs.current[year];
            if (!player) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              // get current song from player
              const videoData = player.getVideoData();
              if (videoData) {
                const { artist, song } = extractArtistAndSong(
                  videoData.title || "",
                  videoData.author || "",
                );
                setCurrentSong(song);
                setCurrentArtist(artist);
              }
              // clearrrrr interval
              if (currentIntervalRefs[year]) {
                const interval = currentIntervalRefs[year];
                if (interval) {
                  clearInterval(interval);
                }
                currentIntervalRefs[year] = null;
                console.log(`Cleared previous interval for year ${year}`);
              }
              // make a newww intervalllll
              currentIntervalRefs[year] = setInterval(() => {
                const currentTime = player.getCurrentTime();
                console.log(`Year ${year} currentTime:`, currentTime);
                if (currentTime >= 15) {
                  player.pauseVideo();
                  const interval = currentIntervalRefs[year];
                  if (interval) {
                    clearInterval(interval);
                  }
                  currentIntervalRefs[year] = null;
                  setCurrentQuestionYear(year);
                  setShowPrompt(true);
                  console.log(`Paused video for year ${year} at 15 seconds`);
                }
              }, 500);
              console.log(`Set up interval for year ${year}`);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              // clear interval if da songs paused
              if (currentIntervalRefs[year]) {
                const interval = currentIntervalRefs[year];
                if (interval) {
                  clearInterval(interval);
                }
                currentIntervalRefs[year] = null;
                console.log(`Cleared interval for year ${year} on pause/end`);
              }
            }
          },
        },
      });
    });

    // Update the ref with our local copy
    intervalRefs.current = currentIntervalRefs;

    return () => {
      // Use the local copy in cleanup
      Object.entries(currentIntervalRefs).forEach(([year, intervalId]) => {
        if (intervalId) {
          clearInterval(intervalId);
          console.log(`Cleanup: Cleared interval for year ${year}`);
        }
      });
    };
  }, [showYouTubePlayer, selectedYears]);

  const handleDeleteYear = (year: number) => {
    setSelectedYears((prev) => prev.filter((item) => item !== year));
  };

  const handleAddPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames((prevNames) => [...prevNames, ""]);
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);

    if (name.trim() !== "") {
      setErrorIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const currentYear = new Date().getFullYear();
    const validYears = selectedYears.filter(
      (year) => year >= 2000 && year < currentYear,
    );

    const emptyIndexes = playerNames
      .map((name, i) => (name.trim() === "" ? i : -1))
      .filter((i) => i !== -1);

    setErrorIndexes(emptyIndexes);

    if (validYears.length > 0 && emptyIndexes.length === 0) {
      await fetchTopSongs(validYears);
    } else {
      alert("Please complete the form and select valid years.");
    }
  };

  // make players answers lowercased
  function normalize(str: string) {
    return str
      .toLowerCase()
      .replace(
        /\(.*?\)|\[.*?\]|official|video|audio|lyrics|ft\.?|feat\.?|\"|\'|\-|\_|\:|\s+/g,
        " ",
      )
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // get short song name from a youtube titele
  function extractSongName(title: string) {
    // remove stuff in brackets like offical songs and stuff
    let shortTitle = title.replace(/\(.*?\)|\[.*?\]/g, "");
    // remove 'official', 'video', 'audio', 'lyrics', 'ft.', 'feat.'
    shortTitle = shortTitle.replace(
      /official|video|audio|lyrics|ft\.?|feat\.?/gi,
      "",
    );
    // if theres a dashtake the part after the first dash
    const dashIndex = shortTitle.indexOf("-");
    if (dashIndex !== -1) {
      shortTitle = shortTitle.slice(dashIndex + 1);
    }
    return shortTitle.trim();
  }

  // get artist and song from youtube titel
  function extractArtistAndSong(title: string, author: string) {
    const dashIndex = title.indexOf(" - ");
    if (dashIndex !== -1) {
      const artist = title.slice(0, dashIndex).trim();
      const song = title.slice(dashIndex + 3).trim();
      return { artist, song };
    }
    // use channel as artist & the title as a song
    return { artist: author, song: title };
  }

  // check if user artist matches any correct artist
  function isArtistCorrect(userArtist: string, correctArtist: string) {
    const normalizedUser = normalize(userArtist);
    const userWords = normalizedUser.split(" ").filter((w) => w.length > 2);
    const correctArtists = correctArtist
      .split(/,|&|feat\.|ft\.|and/gi)
      .map((a) => normalize(a.trim()))
      .filter(Boolean);
    const correctWords = correctArtists.flatMap((a) =>
      a.split(" ").filter((w) => w.length > 2),
    );
    return userWords.some((uw) => correctWords.includes(uw));
  }

  // Encouraging messages for both correct
  const encouragements = [
    "Good Job!",
    "Keep it up!",
    "You're on fire!",
    "Amazing!",
    "Nailed it!",
    "Rockstar!",
    "Impressive!",
    "You crushed it!",
    "Legend!",
    "Fantastic!",
  ];
  const [currentEncouragement, setCurrentEncouragement] = useState<string>(
    encouragements[0]!,
  );
  useEffect(() => {
    if (score > 0) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * encouragements.length);
        setCurrentEncouragement(encouragements[randomIndex]!);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [score, encouragements]);

  // check if user song guess contains one right word
  function isSongCorrect(userSong: string, correctSong: string) {
    const normalizedUser = normalize(userSong);
    const normalizedCorrect = normalize(correctSong);
    const correctWords = normalizedCorrect
      .split(" ")
      .filter((w) => w.length > 2);
    return correctWords.some((word) => normalizedUser.includes(word));
  }

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setVisualizerTime(performance.now());
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (songs) {
    const normalizedUserSong = normalize(userSongAnswer);
    const normalizedCorrectSong = normalize(currentSong);
    const normalizedUserArtist = normalize(userArtistAnswer);
    const normalizedCorrectArtist = normalize(currentArtist);

    const songCorrect = isSongCorrect(
      normalizedUserSong,
      normalizedCorrectSong,
    );
    const artistCorrect = isArtistCorrect(
      normalizedUserArtist,
      normalizedCorrectArtist,
    );

    return (
      <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-[linear-gradient(to_bottom,_black_0%,_#0a0000_15%,_#220000_35%,_#440000_60%,_#660000_100%)] px-6 pt-8 text-white">
        {/* moving vines */}
        <div className="animate-wave pointer-events-none absolute top-0 left-0 h-full w-24 opacity-20">
          <svg
            viewBox="0 0 100 600"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              className="wave-path"
              d="M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600"
              stroke="white"
              strokeWidth="4"
              fill="none"
            />
          </svg>
        </div>
        <div className="animate-wave pointer-events-none absolute top-0 right-0 h-full w-24 scale-x-[-1] opacity-20">
          <svg
            viewBox="0 0 100 600"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              className="wave-path"
              d="M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600"
              stroke="white"
              strokeWidth="4"
              fill="none"
            />
          </svg>
        </div>

        {/* countdown */}
        {showCountdown && (
          <div
            className="bg-opacity-90 fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-6xl font-bold tracking-widest text-white transition-opacity duration-500"
            style={{ opacity: fadeCountdown ? 0 : 1 }}
          >
            <p>ARE YOU READY?</p>
            <p className="mt-6">
              {countdownNumber > 0 ? countdownNumber : "GO!"}
            </p>
          </div>
        )}

        {/* if no countdown show song */}
        {!showCountdown && (
          <>
            <div className="mb-6 flex w-full items-center justify-between">
              <h1 className="text-4xl font-bold">🎵 Let the Game Begin! 🎵</h1>
              <button
                onClick={() => router.push("/")}
                className="rounded-full bg-red-600 px-4 py-2 text-white transition-all hover:bg-red-700"
              >
                Exit Game
              </button>
            </div>
            <p className="mb-4">
              Now playing songs from: {selectedYears.join(", ")}
            </p>
            <ul className="max-w-xl list-inside list-disc">
              {songs.length > 0 &&
                songs.map((song, idx) => (
                  <li key={idx}>
                    {song.title} by {song.artist}
                  </li>
                ))}
            </ul>
            {/* now youtube */}
            {showYouTubePlayer &&
              selectedYears.length > 0 &&
              selectedYears.map((year) => {
                const playlistLinks: Record<number, string> = {
                  2024: "https://www.youtube.com/embed/videoseries?list=PLxA687tYuMWjS8IGRWkCzwTn10XcEccaZ&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2023: "https://www.youtube.com/embed/videoseries?list=PLdv33Q3_-41Hvf43VtcqsfQQOpWFd1_BF&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2022: "https://www.youtube.com/embed/videoseries?list=PLFI4VRJeIyw3fDbrTa_M864mYNXqZ6t7A&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2021: "https://www.youtube.com/embed/videoseries?list=PLuIAx5_9AFUiVwCbv4UN1V0vOJm4e-gwv&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2020: "https://www.youtube.com/embed/videoseries?list=PLaWhSPDmjQ4oBw1U0ak-TK_Pw4I9OGLsU&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2019: "https://www.youtube.com/embed/videoseries?list=PLZjyOXTKuD2Q_VN-XXHK-HVhQl58-ZI_H&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2018: "https://www.youtube.com/embed/videoseries?list=PLnBHN8ndXwY3ngcQxvrQ4CwH6VQcM0enM&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2017: "https://www.youtube.com/embed/videoseries?list=PLFU8AFaV2B6RfG_ZA6GadvT63ABBZtIKi&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2016: "https://www.youtube.com/embed/videoseries?list=PLAvHlMUITRMlUViWK1BWoawOUTZZIl4tG&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2015: "https://www.youtube.com/embed/videoseries?list=PLora6h23WG8UPaQDfC2_cpi4iVPI4Hp0y&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2014: "https://www.youtube.com/embed/videoseries?list=PLCbZNiNDUZtp2pM_BbnRtlc2Y7cyMNVkL&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2013: "https://www.youtube.com/embed/videoseries?list=PLw_s-_bg5n2VuukP3aSQik31jBJ5ICXFq&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2012: "https://www.youtube.com/embed/videoseries?list=PLem9vLZEVqmZ5H67lelbDER05kG8FcF-u&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2011: "https://www.youtube.com/embed/videoseries?list=PL-CYomtw4SPG6XkvXw6AahcSOWTg0PfyA&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2010: "https://www.youtube.com/embed/videoseries?list=PL5579B759A885680C&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2009: "https://www.youtube.com/embed/videoseries?list=PLsdPA0A_fKLlMWIyLdp3d2FrN7t1hiXUE&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2008: "https://www.youtube.com/embed/videoseries?list=PLam08HY53ekvPojGF4hzhAdNE609JCUHo&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2007: "https://www.youtube.com/embed/videoseries?list=PL8629BA4D2BFD141B&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2006: "https://www.youtube.com/embed/videoseries?list=PLCbZNiNDUZtqxO0cnTTqrjUHGdI0AbzyD&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2005: "https://www.youtube.com/embed/videoseries?list=PLqKA0FE2hsOnF7gc5jg6R-aoBerQ8Y5ea&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2004: "https://www.youtube.com/embed/videoseries?list=PLYosk6VjN4ib0lNXBwNVGZ1xjakmuLdnk&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2003: "https://www.youtube.com/embed/videoseries?list=PLqKA0FE2hsOmI1alHexOnn5H6VS948QDd&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2002: "https://www.youtube.com/embed/videoseries?list=PLsdPA0A_fKLmeOQ8SA8toBhiVA_3YY54R&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2001: "https://www.youtube.com/embed/videoseries?list=PLYosk6VjN4iaqktGTn_7iJvJIku6Z5XgG&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                  2000: "https://www.youtube.com/embed/videoseries?list=PLFczJQWL3c0hvajZ3MyNFzUO3QURpY7N0&autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0",
                };

                const playlistURL = playlistLinks[year];
                if (!playlistURL) return null;

                // Show visualizer overlay while video is playing
                const showVisualizer = showYouTubePlayer;
                return (
                  <div
                    key={year}
                    className="relative mx-auto w-fit"
                    style={{ zIndex: 0 }}
                  >
                    <div
                      style={{
                        width: "1100px",
                        height: "600px",
                        overflow: "hidden",
                        borderRadius: "12px",
                        position: "relative",
                        marginTop: "2rem",
                      }}
                    >
                      <iframe
                        ref={(el) => {
                          iframeRefs.current[year] = el;
                        }}
                        id={`youtube-player-${year}`}
                        src={`${playlistURL}&enablejsapi=1&index=${index}`}
                        width="640"
                        height="390"
                        frameBorder="0"
                        allowFullScreen={false}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        style={{
                          borderRadius: "12px",
                          marginTop: "-30px",
                          pointerEvents: "none",
                          zIndex: 1,
                          position: "relative",
                        }}
                        loading="lazy"
                      />
                      {showVisualizer && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 9999,
                            pointerEvents: "none",
                          }}
                        >
                          {/* Black box background */}
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              width: "100%",
                              height: "100%",
                              background: "black",
                              opacity: 1,
                              zIndex: 1,
                            }}
                          />
                          {/* Circular rainbow line visualizer with logo in the center */}
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              width: 320,
                              height: 320,
                              transform: "translate(-50%, -50%)",
                              pointerEvents: "none",
                              zIndex: 2,
                            }}
                          >
                            <svg
                              width="320"
                              height="320"
                              style={{ position: "absolute", left: 0, top: 0 }}
                            >
                              {Array.from({ length: 48 }).map((_, i) => {
                                const center = 160;
                                const r0 = 100; // logo radius
                                // Animate line length with a sine wave for a lively effect, with a random phase offset
                                const phase = visualizerPhases.current
                                  ? visualizerPhases.current[i]
                                  : 0;
                                const t =
                                  visualizerTime / 600 +
                                  i * 0.18 +
                                  (phase ?? 0);
                                const len = 24 + 36 * Math.abs(Math.sin(t)); // 24-60px
                                const angle = i * 7.5;
                                const rad = (angle * Math.PI) / 180;
                                const x0 = center + r0 * Math.cos(rad);
                                const y0 = center + r0 * Math.sin(rad);
                                const x1 = center + (r0 + len) * Math.cos(rad);
                                const y1 = center + (r0 + len) * Math.sin(rad);
                                const color = `hsl(${angle}, 90%, 60%)`;
                                return (
                                  <line
                                    key={i}
                                    x1={x0}
                                    y1={y0}
                                    x2={x1}
                                    y2={y1}
                                    stroke={color}
                                    strokeWidth={5}
                                    strokeLinecap="round"
                                    style={{
                                      filter: `drop-shadow(0 0 6px ${color})`,
                                    }}
                                  />
                                );
                              })}
                            </svg>
                            {/* Logo - perfectly centered */}
                            <div
                              style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: 200,
                                height: 200,
                                transform: "translate(-50%, -50%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                              }}
                            >
                              <img
                                src="/Guess-The-Jam-Logo.png"
                                alt="Guess the Jam Logo"
                                style={{
                                  width: 200,
                                  height: 200,
                                  borderRadius: "50%",
                                  boxShadow: "0 0 32px 8px #0008",
                                  zIndex: 2,
                                  position: "relative",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            {!volumeUnmuted && (
              <button
                onClick={() => {
                  try {
                    selectedYears.forEach((year) => {
                      const iframeWindow =
                        iframeRefs.current[year]?.contentWindow;
                      if (iframeWindow) {
                        iframeWindow.postMessage(
                          JSON.stringify({
                            event: "command",
                            func: "unMute",
                            args: [],
                          }),
                          "*",
                        );
                      }
                    });
                    setVolumeUnmuted(true); // hides the button after click
                  } catch (err) {
                    console.error("Unmute failed:", err);
                  }
                }}
                className="mt-20 rounded-full bg-green-500 px-6 py-2 text-lg text-white transition-all hover:bg-green-600"
              >
                ▶️ Volume Up
              </button>
            )}

            {/* pop up  */}
            {showPrompt && (
              <div className="prompt-z fixed inset-0 z-[10001] flex items-center justify-center bg-black/80">
                <div className="relative w-full max-w-md rounded-lg bg-[#1e1b4d] p-6 text-white">
                  <h2 className="mb-2 text-2xl font-bold">Guess the Song!</h2>
                  <p className="mb-4">Year: {currentQuestionYear}</p>
                  {pointsEarned !== null && showResult && (
                    <div className="mb-6 w-full text-center text-lg font-bold">
                      {(() => {
                        const anyWrong = !songCorrect || !artistCorrect;
                        const bothWrong = !songCorrect && !artistCorrect;
                        return (
                          <>
                            <span className="mt-6 block text-yellow-400">
                              Your guess:{" "}
                              <span
                                className={
                                  songCorrect
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {userSongAnswer || "(no guess)"}
                              </span>
                              {" - "}
                              <span
                                className={
                                  artistCorrect
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {userArtistAnswer || "(no guess)"}
                              </span>
                              {bothWrong && (
                                <span className="text-red-500"> ❌</span>
                              )}
                              {!anyWrong && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    verticalAlign: "middle",
                                    marginLeft: 4,
                                  }}
                                >
                                  <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M5 13l4 4L19 7"
                                      stroke="#22c55e"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              )}
                            </span>
                            {anyWrong ? (
                              <div className="mt-2">
                                <span className="text-yellow-400">Ans:</span>{" "}
                                <span className="text-white">
                                  {extractSongName(currentSong) || "-"} -{" "}
                                  {currentArtist || "-"}
                                </span>
                              </div>
                            ) : (
                              <div className="mt-6 text-white">
                                {currentEncouragement}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                  {!showResult && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="artist" className="mb-2 block">
                          Artist Name:
                        </label>
                        <input
                          type="text"
                          id="artist"
                          value={userArtistAnswer}
                          onChange={(e) => setUserArtistAnswer(e.target.value)}
                          className="w-full rounded bg-black/50 p-2 text-white"
                          placeholder="Enter artist name"
                        />
                      </div>

                      <div className="mb-6">
                        <label htmlFor="song" className="mb-2 block">
                          Song Title:
                        </label>
                        <input
                          type="text"
                          id="song"
                          value={userSongAnswer}
                          onChange={(e) => setUserSongAnswer(e.target.value)}
                          className="w-full rounded bg-black/50 p-2 text-white"
                          placeholder="Enter song title"
                        />
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => {
                            // check answers
                            let points = 0;
                            const artistCorrect = isArtistCorrect(
                              userArtistAnswer,
                              currentArtist,
                            );
                            const userSong = normalize(userSongAnswer);
                            const correctSong = normalize(currentSong);
                            if (artistCorrect) {
                              points += 5;
                            }
                            if (
                              userSong &&
                              correctSong &&
                              userSong === correctSong
                            ) {
                              points += 5;
                            }
                            setPointsEarned(points);
                            setShowResult(true);
                            if (points === 0) {
                              // setResultColor("text-red-500");
                            } else {
                              // setResultColor("text-green-500");
                              setScore((prev) => prev + points);
                              setShowScore(true);
                            }
                          }}
                          className="rounded bg-yellow-400 px-6 py-2 font-bold text-black hover:bg-yellow-500"
                        >
                          Submit
                        </button>
                      </div>
                    </>
                  )}

                  {showResult && (
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => {
                          setUserArtistAnswer("");
                          setUserSongAnswer("");
                          setShowPrompt(false);
                          setShowResult(false);
                          setPointsEarned(null);
                          // go to next song
                          const player =
                            playerRefs.current[currentQuestionYear!];
                          if (player) {
                            player.nextVideo();
                            player.playVideo();
                          }
                        }}
                        className="rounded bg-blue-500 px-6 py-2 font-bold text-white hover:bg-blue-600"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* score counter */}
            {showScore && (
              <div className="fixed right-4 bottom-4 rounded-lg bg-black/80 p-4 text-white">
                <p className="text-xl font-bold">Score: {score}</p>
              </div>
            )}
          </>
        )}
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e1b4d] via-[#3d0063] to-[#4a001c] font-sans text-white">
      {/* vines */}
      <div className="animate-wave pointer-events-none absolute top-0 left-0 h-full w-24 opacity-20">
        <svg
          viewBox="0 0 100 600"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            className="wave-path"
            d="M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      </div>
      <div className="animate-wave pointer-events-none absolute top-0 right-0 h-full w-24 scale-x-[-1] opacity-20">
        <svg
          viewBox="0 0 100 600"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            className="wave-path"
            d="M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      </div>

      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-[4rem]">
          Play Now
        </h1>
        <p className="max-w-2xl text-center text-xl text-white/80">
          What year(s) do you want the songs to be from? Choose a year between
          2000 and the current year.
        </p>

        {/* Year form */}
        <div className="mt-6 flex w-full max-w-sm flex-col items-center">
          <div className="relative flex w-full justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="px-6 py-3 text-lg"
                  style={{ minWidth: "px", marginLeft: "5%" }}
                >
                  Choose A Year
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Years</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, i) => 2000 + i,
                ).map((year) => (
                  <DropdownMenuCheckboxItem
                    key={year}
                    checked={selectedYears.includes(year)}
                    onCheckedChange={() => {
                      if (selectedYears.includes(year)) {
                        setSelectedYears((prev) =>
                          prev.filter((y) => y !== year),
                        );
                      } else {
                        setSelectedYears((prev) => [...prev, year]);
                      }
                    }}
                  >
                    {year}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* remove years */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {selectedYears.map((year) => (
              <div
                key={year}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white"
              >
                <span>{year}</span>
                <button
                  onClick={() => handleDeleteYear(year)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          {/* enter player name */}
          <div className="mt-6 flex w-full max-w-sm flex-col items-center">
            {playerNames.map((name, index) => (
              <div key={index} className="mb-4 w-full">
                <label
                  htmlFor={`player-${index}`}
                  className="mb-2 block text-xl text-white"
                >
                  Player {index + 1} Name
                </label>
                <input
                  type="text"
                  id={`player-${index}`}
                  value={name}
                  onChange={(e) =>
                    handlePlayerNameChange(index, e.target.value)
                  }
                  className={`w-full rounded-lg px-4 py-2 text-white ${
                    errorIndexes.includes(index) ? "bg-red-600" : "bg-black"
                  }`}
                  placeholder={`Enter Player ${index + 1} Name`}
                />
              </div>
            ))}

            {playerNames.length < 6 && (
              <button
                onClick={handleAddPlayer}
                className="flex items-center rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20"
              >
                <span className="mr-2 -translate-y-[2px] transform text-3xl text-pink-500">
                  +
                </span>
                Add Player
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 rounded-full bg-yellow-400 px-6 py-2 text-lg text-white transition-all hover:bg-yellow-500"
          >
            Play
          </button>

          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-full bg-gray-600 px-6 py-2 text-lg text-white transition-all hover:bg-gray-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <footer className="mt-auto flex w-full items-center justify-end bg-transparent px-8 py-4 text-white">
        <div className="text-sm">
          <p>© Copyright 2025 Anika. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes wave {
          0% {
            d: path("M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600");
          }
          50% {
            d: path("M50 0 C30 100, 70 200, 50 300 C30 400, 70 500, 50 600");
          }
          100% {
            d: path("M50 0 C20 100, 80 200, 50 300 C20 400, 80 500, 50 600");
          }
        }
        .wave-path {
          animation: wave 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
