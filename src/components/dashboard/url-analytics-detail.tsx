"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Clock,
  MousePointer,
  Activity,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UrlAnalytics {
  url: {
    id: string;
    shortCode: string;
    originalUrl: string;
    title?: string | null;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
    expiresAt?: string | null;
  };
  totalClicks: number;
  clicksToday: number;
  clicksYesterday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  clicksLastMonth: number;
  recentClicks: Array<{
    id: string;
    clickedAt: string;
    device?: string | null;
    browser?: string | null;
    os?: string | null;
    country?: string | null;
    city?: string | null;
    referer?: string | null;
    ipAddress?: string | null;
  }>;
  hourlyData: Array<{
    hour: number;
    clicks: number;
    label: string;
  }>;
  dailyData: Array<{
    date: string;
    clicks: number;
    label: string;
  }>;
  deviceStats: Array<{
    device: string | null;
    count: number;
  }>;
  browserStats: Array<{
    browser: string | null;
    count: number;
  }>;
  osStats: Array<{
    os: string | null;
    count: number;
  }>;
  countryStats: Array<{
    country: string | null;
    count: number;
  }>;
  cityStats: Array<{
    city: string | null;
    count: number;
  }>;
  referrerStats: Array<{
    referer: string | null;
    count: number;
  }>;
}

interface UrlAnalyticsDetailProps {
  urlId: string;
}

export function UrlAnalyticsDetail({ urlId }: UrlAnalyticsDetailProps) {
  const [analytics, setAnalytics] = useState<UrlAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analytics/${urlId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("URL not found");
          } else {
            setError("Failed to load analytics");
          }
          return;
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [urlId]);

  const copyToClipboard = async () => {
    if (!analytics) return;

    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${analytics.url.shortCode}`,
      );
      setCopiedUrl(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      toast.error("Failed to copy URL to clipboard");
      console.error("Copy to clipboard failed:", error);
    }
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (device?: string | null) => {
    if (!device) return <Monitor className="h-4 w-4" />;
    if (device.toLowerCase().includes("mobile"))
      return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const calculateChangePercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getMaxClicks = (data: Array<{ clicks: number }>) => {
    return Math.max(...data.map((d) => d.clicks), 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/analytics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error Loading Analytics</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  const todayChange = calculateChangePercent(
    analytics.clicksToday,
    analytics.clicksYesterday,
  );
  const monthChange = calculateChangePercent(
    analytics.clicksThisMonth,
    analytics.clicksLastMonth,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/analytics">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Button>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold">URL Analytics</h1>
            <p className="text-muted-foreground">
              Detailed analytics for your shortened URL
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-lg bg-popover px-3 py-2 rounded border">
                {process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/
                {analytics.url.shortCode}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copiedUrl ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedUrl ? "Copied!" : "Copy"}
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={analytics.url.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit
                </a>
              </Button>
            </div>

            {analytics.url.title && (
              <h2 className="text-xl font-semibold">{analytics.url.title}</h2>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={analytics.url.isActive ? "default" : "secondary"}>
                {analytics.url.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {new Date(analytics.url.createdAt).toLocaleDateString()}
              </Badge>
              {analytics.url.expiresAt && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expires{" "}
                  {new Date(analytics.url.expiresAt).toLocaleDateString()}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground break-all">
              Target: {analytics.url.originalUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Live Data</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clicksToday}</div>
            <div className="flex items-center text-xs">
              {getChangeIcon(todayChange)}
              <span
                className={
                  todayChange > 0
                    ? "text-green-600"
                    : todayChange < 0
                      ? "text-red-600"
                      : "text-muted-foreground"
                }
              >
                {todayChange > 0 ? "+" : ""}
                {todayChange}% vs yesterday
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clicksThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(analytics.clicksThisWeek / 7)} daily average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.clicksThisMonth}
            </div>
            <div className="flex items-center text-xs">
              {getChangeIcon(monthChange)}
              <span
                className={
                  monthChange > 0
                    ? "text-green-600"
                    : monthChange < 0
                      ? "text-red-600"
                      : "text-muted-foreground"
                }
              >
                {monthChange > 0 ? "+" : ""}
                {monthChange}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>24 Hour Activity</CardTitle>
            <CardDescription>
              Clicks by hour over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.hourlyData.map((data) => {
                const maxClicks = getMaxClicks(analytics.hourlyData);
                const percentage = (data.clicks / maxClicks) * 100;

                return (
                  <div key={data.hour} className="flex items-center gap-2">
                    <div className="w-12 text-xs text-muted-foreground">
                      {data.label}
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2 relative">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-xs text-right">{data.clicks}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>30 Day Trend</CardTitle>
            <CardDescription>
              Daily clicks over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {analytics.dailyData.map((data) => {
                const maxClicks = getMaxClicks(analytics.dailyData);
                const percentage =
                  maxClicks > 0 ? (data.clicks / maxClicks) * 100 : 0;

                return (
                  <div
                    key={data.date}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className="w-16 text-muted-foreground">
                      {data.label}
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-1.5 relative">
                      <div
                        className="bg-blue-500 rounded-full h-1.5 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-6 text-right">{data.clicks}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Clicks by device type</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.deviceStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No device data</p>
            ) : (
              <div className="space-y-3">
                {analytics.deviceStats.map((stat) => (
                  <div
                    key={stat.device}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(stat.device)}
                      <span className="text-sm">
                        {stat.device || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{stat.count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {analytics.totalClicks > 0
                          ? Math.round(
                              (stat.count / analytics.totalClicks) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
            <CardDescription>Clicks by browser</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.browserStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No browser data</p>
            ) : (
              <div className="space-y-3">
                {analytics.browserStats.slice(0, 5).map((stat) => (
                  <div
                    key={stat.browser}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">
                        {stat.browser || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{stat.count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {analytics.totalClicks > 0
                          ? Math.round(
                              (stat.count / analytics.totalClicks) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Countries</CardTitle>
            <CardDescription>Clicks by country</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.countryStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No location data</p>
            ) : (
              <div className="space-y-3">
                {analytics.countryStats.slice(0, 5).map((stat) => (
                  <div
                    key={stat.country}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">
                        {stat.country || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{stat.count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {analytics.totalClicks > 0
                          ? Math.round(
                              (stat.count / analytics.totalClicks) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operating Systems</CardTitle>
            <CardDescription>Clicks by OS</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.osStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No OS data</p>
            ) : (
              <div className="space-y-2">
                {analytics.osStats.slice(0, 8).map((stat) => (
                  <div
                    key={stat.os}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{stat.os || "Unknown"}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {stat.count}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {analytics.totalClicks > 0
                          ? Math.round(
                              (stat.count / analytics.totalClicks) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
            <CardDescription>Traffic sources</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.referrerStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrer data</p>
            ) : (
              <div className="space-y-2">
                {analytics.referrerStats.slice(0, 8).map((stat) => (
                  <div
                    key={stat.referer}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate flex-1">
                      {stat.referer ? new URL(stat.referer).hostname : "Direct"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {stat.count}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {analytics.totalClicks > 0
                          ? Math.round(
                              (stat.count / analytics.totalClicks) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Clicks</CardTitle>
          <CardDescription>Latest activity on this URL</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentClicks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clicks yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analytics.recentClicks.slice(0, 20).map((click) => (
                <div
                  key={click.id}
                  className="flex items-center justify-between p-3 border rounded text-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getDeviceIcon(click.device)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {click.country && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {click.country}
                          </span>
                        )}
                        {click.city && <span>({click.city})</span>}
                        {click.browser && <span>{click.browser}</span>}
                        {click.os && <span>on {click.os}</span>}
                      </div>
                      {click.referer && (
                        <div className="text-xs text-muted-foreground truncate">
                          From: {new URL(click.referer).hostname}
                        </div>
                      )}
                      {click.ipAddress && (
                        <div className="text-xs text-muted-foreground">
                          IP: {click.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatShortDate(click.clickedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
