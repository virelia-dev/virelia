import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Protected Link - Virelia",
  description:
    "This link is password protected. Enter the password to continue.",
  openGraph: {
    title: "Password Protected Link - Virelia",
    description:
      "This link is password protected. Enter the password to continue.",
    siteName: "Virelia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Password Protected Link - Virelia",
    description:
      "This link is password protected. Enter the password to continue.",
  },
};

export default function PasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
