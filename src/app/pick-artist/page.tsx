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

const songVideoIds: Record<string, string> = {
  "Shake It Off": "nfWlot6h_JM",
  "Love Story": "8xg3vE8Ie_E",
  "Anti-Hero": "b1kbLwvqugk",
  "Blank Space": "e-ORhEE9VVg",
  "You Belong With Me": "VuNIsY6JdUw",
  Cardigan: "K-a8s8OLBSE",
  Willow: "RsEZmictANA",
  "Lavender Haze": "mkR_Qwix4Ho",
  "Midnight Rain": "Odh9ddPUkEY",
  Bejeweled: "b7QlX3yR2xs",

  //drake
  "God's Plan": "xpVfcZ0ZcFM",
  "One Dance": "3IIspaicSnY",
  "Hotline Bling": "uxpDa-c-4Mc",
  "In My Feelings": "DRS_PpOrUZ4",
  "Started From The Bottom": "RubBzkZzpUA",
  "Nice For What": "U9BwWKXjVaI",
  Nonstop: "TbL6x6cBd_Y",
  "Toosie Slide": "3CxtK7-XtE0",
  "Laugh Now Cry Later": "JFm7YDVlqnI",
  "Way 2 Sexy": "vX9msKu75qs",

  //billie eilish
  "Bad Guy": "DyDfgMOUjCI",
  Lovely: "V1Pl8CzNzCw",
  "Happier Than Ever": "5GJWxDKyk3A",
  "Therefore I Am": "RUQl6YcMalg",
  "Ocean Eyes": "viimfQi_pUw",
  "Everything I Wanted": "EgBJmlPo8Xw",
  "My Future": "Dm9Zf1WYQ_A",
  "Lost Cause": "BVEpVhXZsXg",
  NDA: "OORBa32WFcM",
  "Getting Older": "z2mh5HzzvHw",

  // Thhe weekend
  "Blinding Lights": "4NRXx6U8ABQ",
  Starboy: "34Na4j8AVgA",
  "The Hills": "yzTuBuRdAyA",
  "Save Your Tears": "XXYlFuWEuKI",
  "Can't Feel My Face": "KEI4qSrkPAs",
  "After Hours": "ygTZZpVkmKg",
  "Die For You": "uPD0QOGTmMI",
  "Take My Breath": "VOgFZfRVaww",
  Sacrifice: "xcJtL7QggTI",
  "Less Than Zero": "SJzI1C0mFNU",

  // ariagne grande
  "Thank U, Next": "gl1aHhXnN1k",
  "7 Rings": "QYh6mYIJG2Y",
  Positions: "tcYodQoapMg",
  "Side To Side": "SXiSVQZLje8",
  "No Tears Left To Cry": "ffxKSjUwKdU",
  "Break Up With Your Girlfriend": "LH4Y1ZUUx2g",
  "God Is A Woman": "kHLHSlExFis",
  Breathin: "kN0iD0pI3o0",
  "Into You": "1ekZEVeXwek",
  Problem: "iS1g8G_njx8",

  // ed shreean
  "Shape of You": "JGwWNGJdvx8",
  Perfect: "2Vv-BfVoq4g",
  "Thinking Out Loud": "lp-EO5I60KA",
  Photograph: "nSDgHBxUbVQ",
  "Castle on the Hill": "K0ibBPhiaG0",
  "Bad Habits": "orJSJGHjBLI",
  Shivers: "Il0S8BoucSA",
  "Galway Girl": "87gWaABqGYs",
  "Happier (Ed)": "iWZmdoY1aTE",
  "I Don't Care": "y83x7MgzWOA",

  // post malone
  Circles: "wXhTHyIgQ_U",
  Sunflower: "ApXoWvfEYVU",
  Rockstar: "UceaB4D0jpo",
  "Better Now": "UYwF-jdcVjY",
  Goodbyes: "ba7mB8oueCY",
  Wow: "393C3pr2ioY",
  Congratulations: "SC4xMk98Pdc",
  "I Fall Apart": "2ZBtPf7FOoM",
  Psycho: "au2n7VVGv_c",
  "Stay (Post Malone)": "0s5EEpkEcfU",

  // harry styls
  "As It Was": "H5v3kku4y6Q",
  "Watermelon Sugar": "E07s5ZYygMg",
  "Adore You": "VF-r5TtlT9w",
  "Sign of the Times": "qN4ooNx77u0",
  "Late Night Talking": "2OKo7LhU6Zk",
  Golden: "P3cffdsEXXw",
  Falling: "olGSAVOkkTI",
  "Lights Up": "9NZvM1918_E",
  Kiwi: "MrPpFIrXvXM",
  Matilda: "tGhpGzW03hY",

  // olivia rodrigo
  "Drivers License": "ZmDBbnmKpqQ",
  "Good 4 U": "gNi_6U5Pm_o",
  "Deja Vu": "cii6ruuycQA",
  Traitor: "CRrfyVHotP4",
  Vampire: "Bg7EzQ0X9nA",
  Brutal: "OGUy2UmRxJc",
  "Happier (Olivia)": "zmiZJ9Bx-PY",
  "Jealousy, Jealousy": "FqQlz9zYZSg",
  "1 Step Forward, 3 Steps Back": "QQj_8jaE4oQ",
  "Favorite Crime": "RgQ8Y2fI9Bw",

  // bad bunny
  "Tití Me Preguntó": "QpKkNvmWlS8",
  "Moscow Mule": "lk1mQCgrKJg",
  "Después de la Playa": "Rzo8zZ9LZXA",
  Efecto: "Rw5kBmljVXo",
  "Un Coco": "avPK10Z2Mwo",
  "Me Porto Bonito": "OSUxrSe5GbI",
  "Ojitos Lindos": "UqtJGyqJkNA",
  Neverita: "6iJ0Z4l5o3c",
  "El Apagón": "qPq3sofgNmQ",
  "Yo No Soy Celoso": "R6m2eN6CY6Y",

  // SZA
  "Kill Bill": "MSRcC626prw",
  Snooze: "LDY_XyxBu8A",
  "Good Days": "38M7GcN0lD0",
  "I Hate U": "hhYxs5ft5YM",
  Shirt: "dBRwF4HY0HM",
  "Love Galore": "hHXfCOjb3fk",
  "The Weekend": "dzmF6_BM4Ao",
  "Broken Clocks": "WRJYngjLqR0",
  "Drew Barrymore": "dp45V_M4Akw",
  "Normal Girl": "xLsmgHYiOdA",

  // kendrick lamar
  "HUMBLE.": "tvTRZJ-4EyI",
  "DNA.": "NLZRYQMLDW4",
  "LOVE.": "ox7RsX1Ee34",
  Alright: "Z-48u_uWMHY",
  "Swimming Pools": "8-ejyHzz3XE",
  "King Kunta": "hRK7PVJFbS8",
  "Bitch, Don't Kill My Vibe": "GF8aaTu2kg0",
  "Money Trees": "Z-48u_uWMHY",
  "Poetic Justice": "QJLxruO3su0",
  "Backseat Freestyle": "NLZRYQMLDW4",

  // dojo cat
  "Say So": "pok8H_KF1FA",
  "Kiss Me More": "0EVVKs6DQLo",
  Woman: "yxW5yuzVi8w",
  "Need to Know": "dI3xkL7qUAc",
  "Agora Hills": "9j1NHcIftwY",
  Streets: "jJdlgKzVsnI",
  "Get Into It (Yuh)": "9Ko-nEYJ1GE",
  "Like That": "Bsqht2ddJVU",
  "Boss Bitch": "gr8Y2GFCGuk",
  "Paint The Town Red": "m4_9TFeMfJE",

  // travis scott
  "SICKO MODE": "6ONRf7h3Mdk",
  goosebumps: "Dst9gZkq1a8",
  "Butterfly Effect": "_EyZUTDAH0U",
  "Highest in the Room": "tvTRZJ-4EyI",
  "FE!N": "7PyCshJXoRQ",
  Antidote: "KnZ8h3MRuYg",
  "90210": "4xj5cGoJQWI",
  Mamacita: "4xj5cGoJQWI",
  Uptown: "cspqIt4GFtQ",
  "Upper Echelon": "cspqIt4GFtQ",

  // bts
  Dynamite: "gdZLi9oWNZg",
  Butter: "WMweEpGlu_U",
  "Permission to Dance": "CuklIb9d3fI",
  "Boy With Luv": "XsX3ATc3FbA",
  DNA: "MBdVXkSdhwU",
  "Spring Day": "xEeFrLSkMm8",
  "Blood Sweat & Tears": "hmE9f-TEutc",
  "Fake Love": "7C2z4GqqS5E",
  Idol: "pBuZEGYXA6E",
  "Life Goes On": "-5q5mZbe3V8",

  // blackpink
  "How You Like That": "ioNng23DkIM",
  "Kill This Love": "2S24-y0Ij3Y",
  "DDU-DU DDU-DU": "IHNzOHi8sJs",
  "Pink Venom": "gQlMMD8auMs",
  "Shut Down": "POe9SOEKotk",
  "As If It's Your Last": "Amq-qlqbjYA",
  "Playing With Fire": "9pdj4iJD08s",
  Whistle: "dISNgvVpWlo",
  "Lovesick Girls": "dyRsYk0LyA8",
  "Ice Cream": "vRXZj0DzXIA",

  // imagine dragons
  Thunder: "fKopy74weus",
  Believer: "7wtfhZwyrcc",
  Radioactive: "ktvTqknDobU",
  Demons: "mWRsgZuwf_8",
  Natural: "0I647GU3Jsc",
  "Whatever It Takes": "gOsM-DYAEhY",
  Bones: "TO-_3tck2tg",
  Enemy: "D9G1VOjN_84",
  Sharks: "kUBN2huj-mw",
  "Follow You": "kOn1GZqUvQc",

  // shawn mendes
  Stitches: "VbfpW0pbvaU",
  "Treat You Better": "lY2yjAdbvdQ",
  "There's Nothing Holdin' Me Back": "dT2owtxkU8k",
  Senorita: "Pkh8UtuejGw",
  Wonder: "fHeQemJJQII",
  Mercy: "KkGVmN68ByU",
  "In My Blood": "36tggrpRoTI",
  "Lost in Japan": "ycy30LIbq4w",
  "If I Can't Have You": "oTJ-oqwxdZY",
  "Summer of Love": "HCjNJDNzw8Y",

  // justin bieber
  Sorry: "fRh_vgS2dFE",
  "Love Yourself": "oyEuk8j8imI",
  Peaches: "tQ0yjYUFKAE",
  "Stay (Justin Bieber)": "kTJczUoc26U",
  Ghost: "Fp8msa5uYsc",
  "What Do You Mean?": "DK_0jXPuIr0",
  Baby: "kffacxfA7G4",
  Yummy: "8EJ3zbKTWQ8",
  Intentions: "9pG2SduYzEo",
  "Hold On": "LWeiydKl0mU",

  // adele
  Hello: "YQHsXMglC9A",
  "Easy On Me": "U3ASj1L6_sY",
  "Someone Like You": "hLQl3WQQoQ0",
  "Rolling in the Deep": "rYEDA3JcQqw",
  "Set Fire to the Rain": "Ri7-vnrJD3k",
  "When We Were Young": "DDWKuo3gXMQ",
  "Water Under the Bridge": "7Z5p47kJJNg",
  "Send My Love": "fk4BbF7B29w",
  "All I Ask": "Qxw5fQeKDeA",
  "I Drink Wine": "jzW4vlU4iMk",

  // bruno
  "Uptown Funk": "OPf0YbXqDm0",
  "24K Magic": "UqyT8IEBkvY",
  "That's What I Like": "PMivT7MJ41M",
  Grenade: "SR6iYWJxHqs",
  "Just The Way You Are": "LjhCEhWiKXk",
  "Locked Out of Heaven": "e-fA-gBCkj0",
  "When I Was Your Man": "ekzHIouo8Q4",
  "Count on Me": "yJYXItns2ik",
  "The Lazy Song": "fLexgOxsZu0",
  Finesse: "LsoLEjrDogU",

  // kanye west
  Stronger: "PsO6ZnUZI0g",
  "Gold Digger": "6vwNcNOTVzY",
  Heartless: "Co0tTeuUVhU",
  "All of the Lights": "HAfFfqiYLp0",
  Runaway: "Bm5iA4Zupek",
  "Jesus Walks": "MYF7H_fpc-g",
  "Through the Wire": "uvb-1wjAtk4",
  "Touch the Sky": "YtciJ0n3P1c",
  "Flashing Lights": "ila-hAUXR5U",
  Power: "L53gjP-TtGE",

  // eminem
  "Lose Yourself": "_Yhyp-_hX2s",
  "Not Afraid": "j5-yKhDd64s",
  "Love The Way You Lie": "uelHwf8o7_U",
  "Rap God": "XbGs_qK2PQA",
  Stan: "gOMhN-hfMtY",
  "The Real Slim Shady": "eJO5HU_7_1w",
  "Without Me": "YVkUvmDQ3HY",
  "My Name Is": "sNPnbI1arSE",
  "Cleanin' Out My Closet": "RQ9_TKayu9s",
  Mockingbird: "S9bCLPwzSC0",

  // twice
  Fancy: "kOHB85vDuow",
  "Feel Special": "3ymwOvzhwHs",
  "The Feels": "f5_wn8mexmM",
  "I Can't Stop Me": "CM4CkVFmTds",
  Scientist: "vPwaXytZcgI",
  "What is Love?": "i0p1bmr0EmE",
  "Yes or Yes": "mAKsZ26SabQ",
  Likey: "V2hlQkVJZhE",
  TT: "ePpPVE-GGJw",
  "Cheer Up": "c7rCyll5AeY",

  // new jeans
  Attention: "js1CtxSY38I",
  "Hype Boy": "11cta61wi0g",
  OMG: "As9sEuP02Z0",
  Ditto: "pSUydWEqKwE",
  "Get Up": "kdOQ0pOpi5c",
  Cookie: "VOmIplFAGeg",
  Hurt: "tVIXY14aJms",
  "New Jeans": "kcelgrGY1h8",
  "Super Shy": "ArmDp-zijuc",
  ETA: "jOTfBlKSQYY",

  // stray kids
  "God's Menu": "TQTlCHxyuu8",
  Thunderous: "EaswWiwMVs8",
  Maniac: "OvioeS1ZZ7o",
  "Case 143": "jYSlpC6Ud2A",
  "S-Class": "JsOOis4bBFg",
  "Back Door": "X-uJtV8ScYk",
  "My Pace": "3nlSDxvt6JU",
  Hellevator: "AdfIfFGCqgo",
  "Side Effects": "57n4dZAPxNY",
  Levanter: "UEnvBHB3bDM",
};

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
      "Cardigan",
      "Willow",
      "Lavender Haze",
      "Midnight Rain",
      "Bejeweled",
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
      "Nice For What",
      "Nonstop",
      "Toosie Slide",
      "Laugh Now Cry Later",
      "Way 2 Sexy",
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
      "Everything I Wanted",
      "My Future",
      "Lost Cause",
      "NDA",
      "Getting Older",
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
      "After Hours",
      "Die For You",
      "Take My Breath",
      "Sacrifice",
      "Less Than Zero",
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
      "Break Up With Your Girlfriend",
      "God Is A Woman",
      "Breathin",
      "Into You",
      "Problem",
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
      "Bad Habits",
      "Shivers",
      "Galway Girl",
      "Happier (Ed)",
      "I Don't Care",
    ],
    genre: "Pop",
  },
  {
    id: "7",
    name: "Post Malone",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOfEBef-wEFE6bzm3tAwYrqeha9q0ZqP06qWrBCHs1BWfC8caa6-Ix5aL6p-qXbGaUVqFbJ4hz8zBEhB9_sXdjVTdWm76T6aeJlKRLPyZF",
    songs: [
      "Circles",
      "Sunflower",
      "Rockstar",
      "Better Now",
      "Goodbyes",
      "Wow",
      "Congratulations",
      "I Fall Apart",
      "Psycho",
      "Stay (Post Malone)",
    ],
    genre: "Hip-Hop",
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
      "Golden",
      "Falling",
      "Lights Up",
      "Kiwi",
      "Matilda",
    ],
    genre: "Pop",
  },
  {
    id: "10",
    name: "Olivia Rodrigo",
    image:
      "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSUGdBVQwJkxZB3djBeNOxO3YB14dkK3e2X-TNUC1AohR1DKVtubLEadYQRx4YaVChOBmz5HGFJWB4CaDmwwBzJHMv8EFsQvHue4HzKHqZXSQ",
    songs: [
      "Drivers License",
      "Good 4 U",
      "Deja Vu",
      "Traitor",
      "Vampire",
      "Brutal",
      "Happier (Olivia)",
      "Jealousy, Jealousy",
      "1 Step Forward, 3 Steps Back",
      "Favorite Crime",
    ],
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
      "Me Porto Bonito",
      "Ojitos Lindos",
      "Neverita",
      "El Apagón",
      "Yo No Soy Celoso",
    ],
    genre: "Hip-Hop",
  },
  {
    id: "12",
    name: "SZA",
    image:
      "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRp9wMrGqzaGyypGXEFowDyWrkDhAoXKoXkadFf9tBXB9Z3EN6uyHilo0Y0lLq8mgkaQuPlncUjKzf8TjhnMkd4trsIe49GJQkG_z3WwZzIRA",
    songs: [
      "Kill Bill",
      "Snooze",
      "Good Days",
      "I Hate U",
      "Shirt",
      "Love Galore",
      "The Weekend",
      "Broken Clocks",
      "Drew Barrymore",
      "Normal Girl",
    ],
    genre: "Hip-Hop",
  },
  {
    id: "13",
    name: "Kendrick Lamar",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrEJWQD6K71-M7X-86-lyr5b_PVPkYj0stg7PaVy6DPJNq9tB89hqi6ULFC0hll2wJgnsic6qYkSWDFkGYXPVI28eC-n7DidO-DOM5LtMDhQ",
    songs: [
      "HUMBLE.",
      "DNA.",
      "LOVE.",
      "Alright",
      "Swimming Pools",
      "King Kunta",
      "Bitch, Don't Kill My Vibe",
      "Money Trees",
      "Poetic Justice",
      "Backseat Freestyle",
    ],
    genre: "Hip-Hop",
  },
  {
    id: "14",
    name: "Doja Cat",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQafl8T-6bWn9aPsAAIihbmxHKxmYn3ukMY4OGnDfNlfqBkaEHYkcSB_tbItVXBaIg3ddSEg_4ZNg7brUlHfAlISRf3BgIqU5_flJKWwwEi",
    songs: [
      "Say So",
      "Kiss Me More",
      "Woman",
      "Need to Know",
      "Agora Hills",
      "Streets",
      "Get Into It (Yuh)",
      "Like That",
      "Boss Bitch",
      "Paint The Town Red",
    ],
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
      "Antidote",
      "90210",
      "Mamacita",
      "Uptown",
      "Upper Echelon",
    ],
    genre: "Hip-Hop",
  },
  {
    id: "16",
    name: "BTS",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZCgEvT_LmyMSwU2HKzWsSA4DUAungaqcf2psC_B-A9tdZfHoL7C7d2tgBtxYVZ-m7Xmihf5uIaKK3Xj3D8DzTGNnCWqCZD_sNPbikxdXX4A",
    songs: [
      "Dynamite",
      "Butter",
      "Permission to Dance",
      "Boy With Luv",
      "DNA",
      "Spring Day",
      "Blood Sweat & Tears",
      "Fake Love",
      "Idol",
      "Life Goes On",
    ],
    genre: "K-Pop",
  },
  {
    id: "17",
    name: "BLACKPINK",
    image:
      "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSV8Oar7nl1gCxJO3G1nkrdbKyYb7uCPBzn0O_6dIfiDiOIQsK7NgmOoeaFPghc_pWqSnqnZMPWMIeBf5s5TduNS2DiOTtqp1r_2JoPkNw",
    songs: [
      "How You Like That",
      "Kill This Love",
      "DDU-DU DDU-DU",
      "Pink Venom",
      "Shut Down",
      "As If It's Your Last",
      "Playing With Fire",
      "Whistle",
      "Lovesick Girls",
      "Ice Cream",
    ],
    genre: "K-Pop",
  },
  {
    id: "18",
    name: "Imagine Dragons",
    image:
      "https://i8.amplience.net/i/naras/Imagine-Dragons-Eric-Ray%20-Davidson",
    songs: [
      "Thunder",
      "Believer",
      "Radioactive",
      "Demons",
      "Natural",
      "Whatever It Takes",
      "Bones",
      "Enemy",
      "Sharks",
      "Follow You",
    ],
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
      "Mercy",
      "In My Blood",
      "Lost in Japan",
      "If I Can't Have You",
      "Summer of Love",
    ],
    genre: "Pop",
  },

  {
    id: "22",
    name: "Justin Bieber",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxEbyirutCd9BDb_OhURtDwTM5L1OIB5coXrDeCC9JiBboNwOHAYIluUAAm7aRFfAflGAYE-pXLO7dv3IsU3uGHDQ_rTRPtuHWPbt_NVbXIg",
    songs: [
      "Sorry",
      "Love Yourself",
      "Peaches",
      "Stay (Justin Bieber)",
      "Ghost",
      "What Do You Mean?",
      "Baby",
      "Yummy",
      "Intentions",
      "Hold On",
    ],
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
      "When We Were Young",
      "Water Under the Bridge",
      "Send My Love",
      "All I Ask",
      "I Drink Wine",
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
      "Locked Out of Heaven",
      "When I Was Your Man",
      "Count on Me",
      "The Lazy Song",
      "Finesse",
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
      "Jesus Walks",
      "Through the Wire",
      "Touch the Sky",
      "Flashing Lights",
      "Power",
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
      "The Real Slim Shady",
      "Without Me",
      "My Name Is",
      "Cleanin' Out My Closet",
      "Mockingbird",
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
      "Die For You",
      "Take My Breath",
      "Sacrifice",
      "Less Than Zero",
      "Out of Time",
    ],
    genre: "Pop",
  },

  {
    id: "31",
    name: "TWICE",
    image:
      "https://kpopomo.shop/cdn/shop/articles/twice-kpop.jpg?v=1597022504&width=360",
    songs: [
      "Fancy",
      "Feel Special",
      "The Feels",
      "I Can't Stop Me",
      "Scientist",
      "What is Love?",
      "Yes or Yes",
      "Likey",
      "TT",
      "Cheer Up",
    ],
    genre: "K-Pop",
  },
  {
    id: "32",
    name: "NewJeans",
    image:
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcT2sKPYq6-V0gHkz88N7HBHDs6gneJ8LAIsDvu9ZPzB93F4Dw5thlaQRgVGGOkfE23I7KlUDDOnwqVebsSiqBVseTPpXlw5qxES6vbYPZ9Dwg",
    songs: [
      "Attention",
      "Hype Boy",
      "OMG",
      "Ditto",
      "Get Up",
      "Cookie",
      "Hurt",
      "New Jeans",
      "Super Shy",
      "ETA",
    ],
    genre: "K-Pop",
  },
  {
    id: "33",
    name: "Stray Kids",
    image:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT3E4QAVJQCQ2tGGM_fuDFngZIbYAhHkoqa3y6eUuggL0GejNc9bKSkZ4nKP8Z1-v1z7kAb2z3jtPtD7NJWvMjMx992qLcM4Y9-1NzlilCG",
    songs: [
      "God's Menu",
      "Thunderous",
      "Maniac",
      "Case 143",
      "S-Class",
      "Back Door",
      "My Pace",
      "Hellevator",
      "Side Effects",
      "Levanter",
    ],
    genre: "K-Pop",
  },
];

interface YouTubePlayer extends YT.Player {
  __intervalAttached?: boolean;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

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
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>("");
  const [hintUsed, setHintUsed] = useState(false);
  const [hintCooldown, setHintCooldown] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const searchAndPlayYouTubeVideo = async (
    songTitle: string,
    artist: string,
  ) => {
    try {
      console.log("Looking up YouTube video for:", songTitle, "by", artist);

      // Look up the video ID from our predefined mapping
      const videoId = songVideoIds[songTitle];

      if (videoId) {
        console.log("Found video ID:", videoId);
        setYoutubeVideoId(videoId);
        setShowYouTubePlayer(true);
        // Wait for DOM to update before initializing player
        setTimeout(() => {
          initializeYouTubePlayer(videoId);
        }, 100);
      } else {
        console.log("No video ID found for song:", songTitle);
        setShowYouTubePlayer(true);
      }
    } catch (error) {
      console.error("Error looking up YouTube video:", error);
      setShowYouTubePlayer(true);
    }
  };

  const initializeYouTubePlayer = (videoId: string) => {
    const iframe = document.getElementById("youtube-player-artist");
    if (!iframe) {
      console.error("YouTube player iframe not found");
      return;
    }

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API is ready");
        createPlayer(videoId);
      };
    } else {
      createPlayer(videoId);
    }
  };

  const createPlayer = (videoId: string) => {
    const iframe = document.getElementById("youtube-player-artist");
    if (!iframe || !window.YT) return;

    playerRef.current = new window.YT.Player(iframe, {
      height: "390",
      width: "640",
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        iv_load_policy: 3,
        playsinline: 1,
        showinfo: 0,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          console.log("YouTube Player for artist challenge is ready");
          event.target.playVideo();
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            if (!playerRef.current?.__intervalAttached && playerRef.current) {
              playerRef.current.__intervalAttached = true;
              intervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                  const currentTime = playerRef.current.getCurrentTime();
                  const duration = playerRef.current.getDuration();

                  if (duration && currentTime >= duration - 5) {
                    playerRef.current?.seekTo(0, true);
                  }
                }
              }, 1000);
            }
          }
        },
      },
    });
  };

  const playHint = () => {
    if (hintCooldown) return;

    setHintCooldown(true);
    setHintUsed(true);

    if (playerRef.current) {
      const duration = playerRef.current.getDuration();
      const randomStartTime = Math.random() * Math.max(0, duration - 10);

      playerRef.current.seekTo(randomStartTime, true);
      playerRef.current.unMute();

      // Stop playing after exactly 10 seconds
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.mute();
          playerRef.current.pauseVideo();
        }
        setHintCooldown(false);
      }, 10000);
    } else {
      // Fallback when no YouTube player is available
      console.log("Hint used (no YouTube player available)");
      setTimeout(() => {
        setHintCooldown(false);
      }, 1000);
    }
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
    setHintUsed(false);
    setHintCooldown(false);
    setGamePhase("playing");

    if (randomArtist && randomSong) {
      searchAndPlayYouTubeVideo(randomSong, randomArtist.name);
    }

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
      setScore((prev) => prev + (hintUsed ? 5 : 10));
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
    setShowYouTubePlayer(false);
    setYoutubeVideoId("");
    setHintUsed(false);
    setHintCooldown(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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

          {filteredArtists.length >= 12 && selectedGenre !== "Pop" && (
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

            {showYouTubePlayer && (
              <div className="mb-6 flex justify-center">
                <div
                  id="youtube-player-artist"
                  className="rounded-lg"
                  style={{ width: "640px", height: "390px" }}
                ></div>
              </div>
            )}

            {!showYouTubePlayer && (
              <div className="mb-6 flex justify-center">
                <div className="rounded-lg bg-white/10 p-8 text-center">
                  <p className="text-white/80">Loading song...</p>
                </div>
              </div>
            )}

            <div className="mb-6 flex justify-center">
              <Button
                onClick={playHint}
                disabled={hintCooldown || hintUsed}
                className={`px-6 py-2 text-white ${
                  hintCooldown || hintUsed
                    ? "cursor-not-allowed bg-gray-600"
                    : "bg-pink-500 hover:bg-pink-600"
                }`}
              >
                {hintCooldown
                  ? "Hint Playing..."
                  : hintUsed
                    ? "Hint Used"
                    : "🎵 Hint"}
              </Button>
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
                <p className="mt-2 font-bold text-green-400">
                  +{hintUsed ? "5" : "10"} points!
                </p>
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
