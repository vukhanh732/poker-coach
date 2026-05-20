import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Poker Coach",
    template: "%s | Poker Coach",
  },
  description:
    "Study poker the right way. Preflop ranges, pot odds, hand history, and AI-powered analysis for $1/$2 and $2/$3 live cash players.",
  keywords: ["poker", "poker study", "preflop ranges", "pot odds", "hand history", "poker training"],
  authors: [{ name: "Poker Coach" }],
  creator: "Poker Coach",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Poker Coach",
    description: "Study poker the right way. Built for live cash players.",
    siteName: "Poker Coach",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poker Coach",
    description: "Study poker the right way. Built for live cash players.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poker Coach",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1f0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
