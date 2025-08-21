import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Guess-The-Jam",
  description: "Developed by Anika Anne",
  icons: [
    {
      rel: "icon",
      url: "/logo.png",
    },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} dark`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <footer className="fixed right-4 bottom-4 z-50 text-sm text-white">
          <p>© Copyright 2025. Developed by Anika Anne</p>
        </footer>
        <audio id="bg-music" controls={false} autoPlay loop className="hidden">
          <source src="/bg-music.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </body>
    </html>
  );
}
