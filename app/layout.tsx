import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import { ToastProvider } from "@/components/ui/toast";

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
    default: "Tripzy — Plan Group Trips Together, Powered by AI",
    template: "%s | Tripzy",
  },
  description:
    "Tripzy is an AI-powered collaborative travel planning platform. Plan trips, generate AI itineraries, split expenses, scan receipts, and manage everything in one shared workspace.",
  keywords: [
    "Tripzy",
    "group trip planner",
    "AI itinerary generator",
    "travel planner",
    "expense splitter",
    "receipt OCR",
    "collaborative travel planning",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Tripzy — Plan Group Trips Together, Powered by AI",
    description:
      "One shared workspace for group travel — AI itineraries, expense splitting, maps, receipts, and collaboration.",
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
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}