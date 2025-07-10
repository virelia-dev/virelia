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
    const { originalUrl, title, expiresAt } = body;

    if (!originalUrl) {
      return NextResponse.json(
        { error: "Original URL is required" },
        { status: 400 },
      );
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

    const url = await prisma.url.create({
      data: {
        shortCode,
        originalUrl,
        title: title || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
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
