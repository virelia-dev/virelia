import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shortCode, password } = body;

    if (!shortCode || !password) {
      return NextResponse.json(
        { error: "Short code and password are required" },
        { status: 400 },
      );
    }

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
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    if (!url.isActive) {
      return NextResponse.json({ error: "URL is inactive" }, { status: 410 });
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      return NextResponse.json({ error: "URL has expired" }, { status: 410 });
    }

    if (url.clickLimit && url._count.clicks >= url.clickLimit) {
      return NextResponse.json(
        { error: "URL has reached its click limit" },
        { status: 410 },
      );
    }

    if (url.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const referer = request.headers.get("referer") || "";

    const ua = userAgent.toLowerCase();
    let device = "Desktop";
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      device = "Mobile";
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      device = "Tablet";
    }

    let browser = "Unknown";
    if (ua.includes("chrome") && !ua.includes("edge")) {
      browser = "Chrome";
    } else if (ua.includes("firefox")) {
      browser = "Firefox";
    } else if (ua.includes("safari") && !ua.includes("chrome")) {
      browser = "Safari";
    } else if (ua.includes("edge")) {
      browser = "Edge";
    } else if (ua.includes("opera")) {
      browser = "Opera";
    }

    let os = "Unknown";
    if (ua.includes("windows")) {
      os = "Windows";
    } else if (ua.includes("mac")) {
      os = "macOS";
    } else if (ua.includes("linux")) {
      os = "Linux";
    } else if (ua.includes("android")) {
      os = "Android";
    } else if (
      ua.includes("ios") ||
      ua.includes("iphone") ||
      ua.includes("ipad")
    ) {
      os = "iOS";
    }

    await prisma.click.create({
      data: {
        urlId: url.id,
        userAgent,
        ipAddress,
        referer,
        device,
        browser,
        os,
        country: "Local",
      },
    });

    return NextResponse.json({ originalUrl: url.originalUrl });
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
