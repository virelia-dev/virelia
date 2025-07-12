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
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  TrendingUp,
  Wifi,
  WifiOff,
  Search,
  Users,
  MousePointer,
  Activity,
} from "lucide-react";
import { useRealTimeAnalytics } from "~/hooks/use-real-time-analytics";
import Link from "next/link";

interface AnalyticsData {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  topUrls: Array<{
    id: string;
    shortCode: string;
    title?: string | null;
    originalUrl: string;
    clicks: number;
  }>;
  recentClicks: Array<{
    id: string;
    shortCode: string;
    country?: string | null;
    device?: string | null;
    browser?: string | null;
    clickedAt: string;
  }>;
  deviceStats: Array<{
    device: string | null;
    count: number;
  }>;
  countryStats: Array<{
    country: string | null;
    count: number;
  }>;
}

interface Url {
  id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  description?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  _count?: {
    clicks: number;
  };
}

export function AnalyticsOverview() {
  const {
    data: realTimeData,
    isLoading,
    error: realtimeError,
  } = useRealTimeAnalytics();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [urls, setUrls] = useState<Url[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);

  useEffect(() => {
    if (realTimeData) {
      setAnalytics(realTimeData);
    }
  }, [realTimeData]);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await fetch("/api/urls");
        if (response.ok) {
          const data = await response.json();
          setUrls(data);
        }
      } catch (error) {
        console.error("Error fetching URLs:", error);
      } finally {
        setIsLoadingUrls(false);
      }
    };

    fetchUrls();
  }, []);

  const filteredUrls = urls.filter(
    (url) =>
      url.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
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

  const calculateClickRate = () => {
    if (!analytics || analytics.totalUrls === 0) return 0;
    return (
      Math.round((analytics.totalClicks / analytics.totalUrls) * 100) / 100
    );
  };

  const calculateGrowthRate = () => {
    if (!analytics || analytics.clicksThisMonth === 0) return 0;
    const weeklyAverage = analytics.clicksThisWeek / 7;
    const monthlyAverage = analytics.clicksThisMonth / 30;
    if (monthlyAverage === 0) return 0;
    return Math.round(
      ((weeklyAverage - monthlyAverage) / monthlyAverage) * 100,
    );
  };

  if (isLoading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-primary/10 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-40 bg-primary/10 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics && realtimeError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Unable to load analytics data
            <div className="text-sm text-destructive">{realtimeError}</div>{" "}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {analytics ? (
            <>
              <Wifi className="h-4 w-4 text-success" />
              <span className="text-success">Real-time data</span>{" "}
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-warning" />
              <span className="text-warning">Loading...</span>{" "}
            </>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalUrls || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.activeUrls || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalClicks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateClickRate()} avg clicks per URL
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.clicksToday || 0}
            </div>
            <p className="text-xs text-muted-foreground">clicks today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateGrowthRate() > 0 ? "+" : ""}
              {calculateGrowthRate()}%
            </div>
            <p className="text-xs text-muted-foreground">
              weekly vs monthly avg
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.clicksThisWeek || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics?.clicksThisWeek || 0) / 7)} daily average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.clicksThisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics?.clicksThisMonth || 0) / 30)} daily average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalUrls
                ? Math.round((analytics.activeUrls / analytics.totalUrls) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">URLs are active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Top Performing URLs
              {analytics && (
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              )}
            </CardTitle>
            <CardDescription>Your most clicked links</CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics?.topUrls || analytics.topUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clicks yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.topUrls.slice(0, 5).map((url, index) => (
                  <div
                    key={url.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-mono text-sm truncate">
                          /{url.shortCode}
                        </span>
                        <Link
                          href={`/dashboard/analytics/${url.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                      {url.title && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {url.title}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{url.clicks}</div>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest clicks on your links</CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics?.recentClicks || analytics.recentClicks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {analytics.recentClicks.slice(0, 5).map((click) => (
                  <div
                    key={click.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(click.device)}
                      <div>
                        <div className="font-mono text-sm">
                          /{click.shortCode}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {click.country && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {click.country}
                            </span>
                          )}
                          {click.browser && <span>{click.browser}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(click.clickedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>Clicks by device category</CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics?.deviceStats || analytics.deviceStats.length === 0 ? (
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
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Clicks by country</CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics?.countryStats || analytics.countryStats.length === 0 ? (
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

      <Card>
        <CardHeader>
          <CardTitle>Search URLs for Detailed Analytics</CardTitle>
          <CardDescription>
            Find a specific URL to view its detailed analytics
          </CardDescription>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, URL, or short code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingUrls ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-primary/10 rounded animate-pulse"
                />
              ))}
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {urls.length === 0 ? (
                <p>No URLs created yet</p>
              ) : (
                <p>No URLs match your search</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredUrls.slice(0, 10).map((url) => (
                <div
                  key={url.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-popover px-2 py-1 rounded border">
                        /{url.shortCode}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {url._count?.clicks || 0} clicks
                      </Badge>
                    </div>
                    {url.title && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {url.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {url.originalUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/analytics/${url.id}`}>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {filteredUrls.length > 10 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Showing first 10 results. Refine your search to see more.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
