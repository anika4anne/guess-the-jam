import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Guess-The-Jam",
  description: "Developed by Anika Anne",
  icons: [
    {
      rel: "icon",
      url: "https://res.cloudinary.com/dp0illmdm/image/upload/v1747014951/Untitled_design_gk5uao.png",
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
      <body>
        {children}{" "}
        <audio controls={false} autoPlay loop className="hidden">
          <source src="/bg-music.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </body>
    </html>
  );
}
