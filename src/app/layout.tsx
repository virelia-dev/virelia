import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "~/components/navbar";
import { Toaster } from "~/components/ui/sonner";
import favicon from "~/assets/favicon.svg";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Virelia",
  description: "A simple, fast URL shortener built for open source",
  icons: {
    icon: favicon.src,
    shortcut: favicon.src,
    apple: favicon.src,
  },
  openGraph: {
    title: "Virelia",
    description: "A simple, fast URL shortener built for open source",
    url: "https://virelia.dev",
    siteName: "Virelia",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} dark`}
    >
      <body>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
