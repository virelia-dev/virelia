import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth-server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const urls = await prisma.url.findMany({
      where: {
        userId: authData.user.id,
      },
      include: {
        domain: true,
        _count: {
          select: {
            clicks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(urls);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return NextResponse.json(
      { error: "Failed to fetch URLs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      originalUrl,
      title,
      tags,
      domainId,
      expiresAt,
      password,
      clickLimit,
    } = body;

    if (!originalUrl) {
      return NextResponse.json(
        { error: "Original URL is required" },
        { status: 400 },
      );
    }

    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json(
        { error: "Please provide a valid URL (including http:// or https://)" },
        { status: 400 },
      );
    }

    if (
      clickLimit &&
      (isNaN(parseInt(clickLimit)) || parseInt(clickLimit) < 1)
    ) {
      return NextResponse.json(
        { error: "Click limit must be a positive number" },
        { status: 400 },
      );
    }

    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        return NextResponse.json(
          { error: "Expiry date must be a valid future date" },
          { status: 400 },
        );
      }
    }

    let shortCode = Math.random().toString(36).substring(2, 8);
    let attempts = 0;
    while (attempts < 5) {
      const existingUrl = await prisma.url.findUnique({
        where: { shortCode },
      });

      if (!existingUrl) break;

      shortCode = Math.random().toString(36).substring(2, 8);
      attempts++;
    }

    if (attempts >= 5) {
      return NextResponse.json(
        { error: "Unable to generate unique short code. Please try again." },
        { status: 500 },
      );
    }

    const url = await prisma.url.create({
      data: {
        shortCode,
        originalUrl,
        title: title || null,
        tags: tags || null,
        domainId: domainId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        password: password || null,
        clickLimit: clickLimit ? parseInt(clickLimit) : null,
        userId: authData.user.id,
      },
    });

    return NextResponse.json(url, { status: 201 });
  } catch (error) {
    console.error("Error creating URL:", error);
    return NextResponse.json(
      { error: "Failed to create URL" },
      { status: 500 },
    );
  }
}
