import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Cormorant_Garamond, Inter, Newsreader, Pinyon_Script } from "next/font/google";

export const metadata: Metadata = {
  title: "ABSTRACTA - Photography Portfolio",
  description: "Contemporary art photography portfolio",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400"],
  style: ["normal", "italic"],
});

const pinyonScript = Pinyon_Script({
  subsets: ["latin"],
  variable: "--font-pinyon-script",
  weight: ["400"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${cormorant.variable} ${inter.variable} ${newsreader.variable} ${pinyonScript.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="light bg-background text-on-background min-h-screen flex flex-col font-body-elegant selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
