import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Twitter } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Battleship",
  description: "Engage in an epic game of Battleship with Ferris.",
  keywords: ["Battleship", "Ferris", "Game", "Strategy", "Rust", "Succinct"],
  authors: [{ name: "Enspire", url: "https://x.com/0xEnsp1re" }],
  themeColor: "#1E90FF",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <div className="absolute bottom-0 left-0 text-white p-4 text-center">
          <span>
            Made by{" "}
            <Link
              href="https://x.com/0xEnsp1re"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold hover:text-pink-200 transition-colors duration-300"
            >
              0xEnsp1re <Twitter size={16} className="inline" />
            </Link>
          </span>
        </div>
      </body>
    </html>
  );
}
