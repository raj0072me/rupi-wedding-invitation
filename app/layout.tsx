import type { Metadata, Viewport } from "next";
import "./globals.css";
import MusicPlayer from "./components/MusicPlayer";
import PetalCanvas from "./components/PetalCanvas";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7A1526",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rupi-wedding-invitation.pages.dev"),
  title: "Rupi's Wedding Details Form ❤️",
  description: "Wedding details form for Rupa (Rupi) — sharing ceremony dates, venues, and family details with Bhai.",
  keywords: ["Rupi Wedding", "Wedding Details", "Faridabad", "Kisan Bhawan"],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/rupi.png", type: "image/png" },
    ],
    apple: [
      { url: "/rupi.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Rupi's Wedding Details Form ❤️",
    description: "Wedding details form for Rupa (Rupi) — sharing ceremony dates, venues, and family details with Bhai.",
    url: "https://rupi-wedding-invitation.pages.dev",
    siteName: "Rupi Wedding",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "₹upi Wedding Invitation Details",
      },
      {
        url: "/og-square.png",
        width: 512,
        height: 512,
        alt: "₹upi Wedding Crest",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "₹upi Wedding Invitation Details ❤️",
    description: "Fill in the wedding invitation card details in one simple, beautiful place.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        {/* Background Mandala & Ambient Radiance */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-pattern-layer" aria-hidden="true" />

        {/* Falling Petals Animation */}
        <PetalCanvas />

        {/* Ambient Music Player */}
        <MusicPlayer />

        {/* Main Content Area */}
        <div className="relative z-20 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
