import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth-server";
import { PrismaClient } from "@prisma/client";
import * as Papa from "papaparse";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (!format || !["csv", "pdf"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Use 'csv' or 'pdf'" },
        { status: 400 },
      );
    }

    const urls = await prisma.url.findMany({
      where: { userId: authData.user.id },
      include: {
        clicks: {
          orderBy: { clickedAt: "desc" },
        },
        _count: { select: { clicks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const allClicks = await prisma.click.findMany({
      where: { url: { userId: authData.user.id } },
      include: {
        url: { select: { shortCode: true, title: true, originalUrl: true } },
      },
      orderBy: { clickedAt: "desc" },
    });

    if (format === "csv") {
      const csvData = await generateCSV(urls, allClicks);
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="virelia-analytics-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (format === "pdf") {
      const pdfData = await generatePDFReport(urls, allClicks, authData.user);
      return new NextResponse(pdfData, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="virelia-analytics-${new Date().toISOString().split("T")[0]}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json(
      { error: "Failed to export analytics" },
      { status: 500 },
    );
  }
}

interface URLWithClicks {
  id: string;
  shortCode: string;
  originalUrl: string;
  title?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
  isActive: boolean;
  userId: string;
  domainId?: string | null;
  password?: string | null;
  clickLimit?: number | null;
  tags: string | null;
  clicks: ClickData[];
  _count: { clicks: number };
}

interface ClickData {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  referer?: string | null;
  country?: string | null;
  city?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  clickedAt: Date;
  urlId: string;
  url?: {
    shortCode: string;
    title?: string | null;
    originalUrl: string;
  };
}

interface User {
  id: string;
  email: string;
  name?: string | null;
}

async function generateCSV(
  urls: URLWithClicks[],
  allClicks: ClickData[],
): Promise<string> {
  const urlRows = urls.map((url) => ({
    type: "URL",
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    title: url.title || "",
    description: url.description || "",
    totalClicks: url._count.clicks,
    isActive: url.isActive,
    createdAt: url.createdAt.toISOString(),
    expiresAt: url.expiresAt?.toISOString() || "",
    tags: url.tags || "",
    clickLimit: url.clickLimit || "",
    hasPassword: !!url.password,
  }));

  const clickRows = allClicks.map((click) => ({
    type: "CLICK",
    shortCode: click.url?.shortCode || "",
    urlTitle: click.url?.title || "",
    originalUrl: click.url?.originalUrl || "",
    clickedAt: click.clickedAt.toISOString(),
    country: click.country || "",
    city: click.city || "",
    device: click.device || "",
    browser: click.browser || "",
    os: click.os || "",
    referer: click.referer || "",
    ipAddress: click.ipAddress || "",
  }));

  const combinedData = [
    ...urlRows.map((row) => ({
      ...row,
      clickedAt: "",
      country: "",
      city: "",
      device: "",
      browser: "",
      os: "",
      referer: "",
      ipAddress: "",
      urlTitle: "",
    })),
    ...clickRows.map((row) => ({
      ...row,
      title: "",
      description: "",
      totalClicks: "",
      isActive: "",
      expiresAt: "",
      tags: "",
      clickLimit: "",
      hasPassword: "",
    })),
  ];

  return Papa.unparse(combinedData);
}

async function generatePDFReport(
  urls: URLWithClicks[],
  allClicks: ClickData[],
  user: User,
): Promise<Buffer> {
  const jsPDF = (await import("jspdf")).default;

  const doc = new jsPDF();
  const margin = 20;
  let yPosition = 30;

  doc.setFontSize(20);
  doc.text("Virelia Analytics Report", margin, yPosition);

  yPosition += 10;
  doc.setFontSize(10);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    margin,
    yPosition,
  );
  doc.text(`User: ${user.email}`, margin, yPosition + 5);

  yPosition += 20;
  doc.setFontSize(14);
  doc.text("Summary", margin, yPosition);

  yPosition += 10;
  doc.setFontSize(10);
  const totalClicks = allClicks.length;
  const totalUrls = urls.length;
  const activeUrls = urls.filter((url) => url.isActive).length;

  doc.text(`Total URLs: ${totalUrls}`, margin, yPosition);
  doc.text(`Active URLs: ${activeUrls}`, margin, yPosition + 5);
  doc.text(`Total Clicks: ${totalClicks}`, margin, yPosition + 10);

  yPosition += 25;
  doc.setFontSize(14);
  doc.text("Top Performing URLs", margin, yPosition);

  yPosition += 10;
  doc.setFontSize(8);
  const topUrls = urls
    .sort((a, b) => b._count.clicks - a._count.clicks)
    .slice(0, 10);

  topUrls.forEach((url, index) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 30;
    }

    doc.text(
      `${index + 1}. /${url.shortCode} (${url._count.clicks} clicks)`,
      margin,
      yPosition,
    );
    if (url.title) {
      doc.text(`   ${url.title}`, margin, yPosition + 3);
    }
    doc.text(
      `   ${url.originalUrl.substring(0, 70)}${url.originalUrl.length > 70 ? "..." : ""}`,
      margin,
      yPosition + 6,
    );
    yPosition += 12;
  });

  yPosition += 10;
  doc.setFontSize(14);
  doc.text("Geographic Distribution", margin, yPosition);

  yPosition += 10;
  doc.setFontSize(8);
  const countryStats = allClicks.reduce(
    (acc: Record<string, number>, click) => {
      const country = click.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {},
  );

  const topCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  topCountries.forEach(([country, count]) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 30;
    }
    doc.text(`${country}: ${count} clicks`, margin, yPosition);
    yPosition += 5;
  });

  yPosition += 10;
  doc.setFontSize(14);
  doc.text("Device Statistics", margin, yPosition);

  yPosition += 10;
  doc.setFontSize(8);
  const deviceStats = allClicks.reduce((acc: Record<string, number>, click) => {
    const device = click.device || "Unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  Object.entries(deviceStats).forEach(([device, count]) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 30;
    }
    doc.text(`${device}: ${count} clicks`, margin, yPosition);
    yPosition += 5;
  });

  return Buffer.from(doc.output("arraybuffer"));
}
