import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Fraunces,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
  IBM_Plex_Mono,
} from "next/font/google";
import DirectoryHeader from "./directory-header";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500"],
});

const plexSansCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  variable: "--font-plex-condensed",
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Cohort",
  description: "The apprentice-only events directory.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${plexSansCondensed.variable} ${plexMono.variable}`}
    >
      <body>
        <div className="board">
          <DirectoryHeader />
          <main className="board-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
