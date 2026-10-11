import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HaqDaar — हक़दार | AI Government Scheme Finder",
    template: "%s | HaqDaar",
  },
  description:
    "Discover every Indian government scheme you qualify for — in your language, in your voice. AI-powered voice & chat conversations powered by Gemini.",
  keywords: [
    "government schemes",
    "India",
    "sarkari yojana",
    "PM schemes",
    "scholarship",
    "ayushman bharat",
    "PM KISAN",
    "HaqDaar",
    "AI voice assistant",
  ],
  openGraph: {
    title: "HaqDaar — हक़दार",
    description:
      "Discover every government scheme you qualify for — in your language, in your voice.",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇮🇳</text></svg>",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "HaqDaar",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.16 0.02 260 / 0.95)",
              color: "oklch(0.95 0.01 260)",
              border: "1px solid oklch(1 0 0 / 0.1)",
              borderRadius: "12px",
              backdropFilter: "blur(12px)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
