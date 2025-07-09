import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "~/components/navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "untitled",
  description: "peekaboo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} dark`}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
