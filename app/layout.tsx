import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TripSync AI — Plan Group Trips Together, Powered by AI",
    template: "%s | TripSync AI",
  },
  description:
    "TripSync AI is a collaborative travel planning platform for groups. Generate AI itineraries, split expenses, and organize your whole trip in one shared workspace.",
  keywords: [
    "group trip planner",
    "AI itinerary generator",
    "travel expense splitter",
    "collaborative travel planning app",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "TripSync AI — Plan Group Trips Together, Powered by AI",
    description:
      "One shared workspace for group travel — AI itineraries, expense splitting, and real-time collaboration.",
    type: "website",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}