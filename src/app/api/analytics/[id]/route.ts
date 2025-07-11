import { NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth-server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { params } = context;
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const url = await prisma.url.findFirst({
      where: {
        id,
        userId: authData.user.id,
      },
      include: {
        _count: { select: { clicks: true } },
      },
    });

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      clicksToday,
      clicksYesterday,
      clicksThisWeek,
      clicksThisMonth,
      clicksLastMonth,
    ] = await Promise.all([
      prisma.click.count({
        where: { urlId: id, clickedAt: { gte: today } },
      }),
      prisma.click.count({
        where: {
          urlId: id,
          clickedAt: { gte: yesterday, lt: today },
        },
      }),
      prisma.click.count({
        where: { urlId: id, clickedAt: { gte: thisWeek } },
      }),
      prisma.click.count({
        where: { urlId: id, clickedAt: { gte: thisMonth } },
      }),
      prisma.click.count({
        where: {
          urlId: id,
          clickedAt: { gte: lastMonth, lt: thisMonth },
        },
      }),
    ]);

    const recentClicks = await prisma.click.findMany({
      where: { urlId: id },
      orderBy: { clickedAt: "desc" },
      take: 50,
      select: {
        id: true,
        clickedAt: true,
        ipAddress: true,
        userAgent: true,
        device: true,
        browser: true,
        os: true,
        country: true,
        city: true,
        referer: true,
      },
    });

    const hourlyClicks = await prisma.click.groupBy({
      by: ["clickedAt"],
      where: {
        urlId: id,
        clickedAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
      _count: { clickedAt: true },
    });

    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      hour.setMinutes(0, 0, 0);

      const clicks = hourlyClicks.filter((click) => {
        const clickHour = new Date(click.clickedAt);
        clickHour.setMinutes(0, 0, 0);
        return clickHour.getTime() === hour.getTime();
      }).length;

      return {
        hour: hour.getHours(),
        clicks,
        label: hour.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    const dailyClicks = await prisma.click.groupBy({
      by: ["clickedAt"],
      where: {
        urlId: id,
        clickedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
      },
      _count: { clickedAt: true },
    });

    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);

      const clicks = dailyClicks.filter((click) => {
        const clickDate = new Date(click.clickedAt);
        clickDate.setHours(0, 0, 0, 0);
        return clickDate.getTime() === date.getTime();
      }).length;

      return {
        date: date.toISOString().split("T")[0],
        clicks,
        label: date.toLocaleDateString([], { month: "short", day: "numeric" }),
      };
    });

    const deviceStats = await prisma.click.groupBy({
      by: ["device"],
      where: { urlId: id },
      _count: { device: true },
      orderBy: { _count: { device: "desc" } },
    });

    const browserStats = await prisma.click.groupBy({
      by: ["browser"],
      where: { urlId: id },
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
      take: 10,
    });

    const osStats = await prisma.click.groupBy({
      by: ["os"],
      where: { urlId: id },
      _count: { os: true },
      orderBy: { _count: { os: "desc" } },
      take: 10,
    });

    const countryStats = await prisma.click.groupBy({
      by: ["country"],
      where: { urlId: id },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 10,
    });

    const cityStats = await prisma.click.groupBy({
      by: ["city"],
      where: { urlId: id },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 10,
    });

    const referrerStats = await prisma.click.groupBy({
      by: ["referer"],
      where: { urlId: id, referer: { not: null } },
      _count: { referer: true },
      orderBy: { _count: { referer: "desc" } },
      take: 10,
    });

    const analytics = {
      url: {
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        title: url.title,
        description: url.description,
        isActive: url.isActive,
        createdAt: url.createdAt.toISOString(),
        expiresAt: url.expiresAt?.toISOString() || null,
      },
      totalClicks: url._count.clicks,
      clicksToday,
      clicksYesterday,
      clicksThisWeek,
      clicksThisMonth,
      clicksLastMonth,
      recentClicks: recentClicks.map((click) => ({
        id: click.id,
        clickedAt: click.clickedAt.toISOString(),
        device: click.device,
        browser: click.browser,
        os: click.os,
        country: click.country,
        city: click.city,
        referer: click.referer,
        ipAddress: click.ipAddress?.replace(/\.\d+$/, ".***"),
      })),
      hourlyData,
      dailyData,
      deviceStats: deviceStats.map((stat) => ({
        device: stat.device,
        count: stat._count.device,
      })),
      browserStats: browserStats.map((stat) => ({
        browser: stat.browser,
        count: stat._count.browser,
      })),
      osStats: osStats.map((stat) => ({
        os: stat.os,
        count: stat._count.os,
      })),
      countryStats: countryStats.map((stat) => ({
        country: stat.country,
        count: stat._count.country,
      })),
      cityStats: cityStats.map((stat) => ({
        city: stat.city,
        count: stat._count.city,
      })),
      referrerStats: referrerStats.map((stat) => ({
        referer: stat.referer,
        count: stat._count.referer,
      })),
    };

    return NextResponse.json(analytics, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching URL analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
