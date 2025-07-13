import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchTargetMetadata(url: string) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Virelia-Bot/1.0 (+https://virelia.dev)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const fullResponse = await fetch(url, {
      headers: {
        "User-Agent": "Virelia-Bot/1.0 (+https://virelia.dev)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!fullResponse.ok) return null;

    const html = await fullResponse.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(
      /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
    );
    const ogTitleMatch = html.match(
      /<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i,
    );
    const ogDescMatch = html.match(
      /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i,
    );
    const ogImageMatch = html.match(
      /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i,
    );
    const twitterImageMatch = html.match(
      /<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i,
    );

    return {
      title: ogTitleMatch?.[1] || titleMatch?.[1] || url,
      description: ogDescMatch?.[1] || descMatch?.[1] || `Visit ${url}`,
      image: ogImageMatch?.[1] || twitterImageMatch?.[1] || null,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> {
  const { shortCode } = await params;

  try {
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url || !url.password) {
      return {
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
    }

    const targetMeta = await fetchTargetMetadata(url.originalUrl);

    if (targetMeta) {
      const baseMetadata: Metadata = {
        title: `🔒 ${targetMeta.title}`,
        description: `This link is password protected. ${targetMeta.description}`,
        openGraph: {
          title: `🔒 ${targetMeta.title}`,
          description: `This link is password protected. ${targetMeta.description}`,
          siteName: "Virelia",
          type: "website",
          ...(targetMeta.image && { images: [{ url: targetMeta.image }] }),
        },
        twitter: {
          card: targetMeta.image ? "summary_large_image" : "summary",
          title: `🔒 ${targetMeta.title}`,
          description: `This link is password protected. ${targetMeta.description}`,
          ...(targetMeta.image && { images: [targetMeta.image] }),
        },
      };

      return baseMetadata;
    }

    return {
      title: `🔒 ${url.title || "Password Protected Link"}`,
      description: `This link is password protected. ${url.description || "Enter the password to continue."}`,
      openGraph: {
        title: `🔒 ${url.title || "Password Protected Link"}`,
        description: `This link is password protected. ${url.description || "Enter the password to continue."}`,
        siteName: "Virelia",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: `🔒 ${url.title || "Password Protected Link"}`,
        description: `This link is password protected. ${url.description || "Enter the password to continue."}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
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
  }
}

export default function PasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
