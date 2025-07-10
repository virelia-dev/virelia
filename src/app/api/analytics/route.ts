import { NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth-server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUrls, activeUrls] = await Promise.all([
      prisma.url.count({
        where: { userId: authData.user.id },
      }),
      prisma.url.count({
        where: { userId: authData.user.id, isActive: true },
      }),
    ]);

    const [totalClicks, clicksToday, clicksThisWeek, clicksThisMonth] =
      await Promise.all([
        prisma.click.count({
          where: { url: { userId: authData.user.id } },
        }),
        prisma.click.count({
          where: {
            url: { userId: authData.user.id },
            clickedAt: { gte: today },
          },
        }),
        prisma.click.count({
          where: {
            url: { userId: authData.user.id },
            clickedAt: { gte: thisWeek },
          },
        }),
        prisma.click.count({
          where: {
            url: { userId: authData.user.id },
            clickedAt: { gte: thisMonth },
          },
        }),
      ]);

    const topUrls = await prisma.url.findMany({
      where: { userId: authData.user.id },
      include: {
        _count: { select: { clicks: true } },
      },
      orderBy: {
        clicks: { _count: "desc" },
      },
      take: 5,
    });

    const recentClicks = await prisma.click.findMany({
      where: { url: { userId: authData.user.id } },
      include: {
        url: { select: { shortCode: true } },
      },
      orderBy: { clickedAt: "desc" },
      take: 10,
    });

    const deviceStats = await prisma.click.groupBy({
      by: ["device"],
      where: { url: { userId: authData.user.id } },
      _count: { device: true },
      orderBy: { _count: { device: "desc" } },
      take: 5,
    });

    const countryStats = await prisma.click.groupBy({
      by: ["country"],
      where: { url: { userId: authData.user.id } },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 5,
    });

    const analytics = {
      totalUrls,
      totalClicks,
      activeUrls,
      clicksToday,
      clicksThisWeek,
      clicksThisMonth,
      topUrls: topUrls.map((url) => ({
        id: url.id,
        shortCode: url.shortCode,
        title: url.title,
        originalUrl: url.originalUrl,
        clicks: url._count.clicks,
      })),
      recentClicks: recentClicks.map((click) => ({
        id: click.id,
        shortCode: click.url.shortCode,
        country: click.country,
        device: click.device,
        browser: click.browser,
        clickedAt: click.clickedAt.toISOString(),
      })),
      deviceStats: deviceStats.map((stat) => ({
        device: stat.device,
        count: stat._count.device,
      })),
      countryStats: countryStats.map((stat) => ({
        country: stat.country,
        count: stat._count.country,
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
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
