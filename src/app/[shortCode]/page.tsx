import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

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
      include: {
        _count: {
          select: {
            clicks: true,
          },
        },
      },
    });

    if (!url) {
      return {
        title: "Link Not Found - Virelia",
        description: "The requested short link could not be found.",
        openGraph: {
          title: "Link Not Found - Virelia",
          description: "The requested short link could not be found.",
          siteName: "Virelia",
          type: "website",
        },
        twitter: {
          card: "summary",
          title: "Link Not Found - Virelia",
          description: "The requested short link could not be found.",
        },
      };
    }

    if (!url.isActive) {
      return {
        title: "Link Disabled - Virelia",
        description: "This short link has been disabled.",
        openGraph: {
          title: "Link Disabled - Virelia",
          description: "This short link has been disabled.",
          siteName: "Virelia",
          type: "website",
        },
        twitter: {
          card: "summary",
          title: "Link Disabled - Virelia",
          description: "This short link has been disabled.",
        },
      };
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      return {
        title: "Link Expired - Virelia",
        description: "This short link has expired.",
        openGraph: {
          title: "Link Expired - Virelia",
          description: "This short link has expired.",
          siteName: "Virelia",
          type: "website",
        },
        twitter: {
          card: "summary",
          title: "Link Expired - Virelia",
          description: "This short link has expired.",
        },
      };
    }

    if (url.clickLimit && url._count.clicks >= url.clickLimit) {
      return {
        title: "Link Limit Reached - Virelia",
        description: "This short link has reached its click limit.",
        openGraph: {
          title: "Link Limit Reached - Virelia",
          description: "This short link has reached its click limit.",
          siteName: "Virelia",
          type: "website",
        },
        twitter: {
          card: "summary",
          title: "Link Limit Reached - Virelia",
          description: "This short link has reached its click limit.",
        },
      };
    }

    if (url.password) {
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
        title: targetMeta.title,
        description: targetMeta.description,
        openGraph: {
          title: targetMeta.title,
          description: targetMeta.description,
          url: url.originalUrl,
          siteName: "Virelia",
          type: "website",
          ...(targetMeta.image && { images: [{ url: targetMeta.image }] }),
        },
        twitter: {
          card: "summary_large_image",
          title: targetMeta.title,
          description: targetMeta.description,
          ...(targetMeta.image && { images: [targetMeta.image] }),
        },
      };

      return baseMetadata;
    }

    return {
      title: url.title || url.originalUrl,
      description: url.description || `Visit ${url.originalUrl}`,
      openGraph: {
        title: url.title || url.originalUrl,
        description: url.description || `Visit ${url.originalUrl}`,
        url: url.originalUrl,
        siteName: "Virelia",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: url.title || url.originalUrl,
        description: url.description || `Visit ${url.originalUrl}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error - Virelia",
      description: "An error occurred while processing this link.",
      openGraph: {
        title: "Error - Virelia",
        description: "An error occurred while processing this link.",
        siteName: "Virelia",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Error - Virelia",
        description: "An error occurred while processing this link.",
      },
    };
  }
}

export default async function ShortCodePage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  redirect(`/api/redirect/${shortCode}`);
}
