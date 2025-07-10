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
import {
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useRealTimeAnalytics } from "~/hooks/use-real-time-analytics";

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

export function AnalyticsDashboard() {
  const {
    data: realTimeData,
    isLoading,
    error: realtimeError,
  } = useRealTimeAnalytics();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (realTimeData) {
      setAnalytics(realTimeData);
    }
  }, [realTimeData]);

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

  if (isLoading && !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-primary/10 rounded animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics && realtimeError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Unable to load analytics data
            <div className="text-sm text-red-500">{realtimeError}</div>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2 text-sm">
          {analytics ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Live Data</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-orange-500" />
              <span className="text-orange-600">Loading...</span>
            </>
          )}
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalClicks || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.clicksToday || 0}
            </div>
            <p className="text-xs text-muted-foreground">Recent clicks</p>
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
              +{analytics?.clicksThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Top Performing URLs
              {analytics && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-mono text-sm truncate">
                          /{url.shortCode}
                        </span>
                      </div>
                      {url.title && (
                        <p className="text-sm text-muted-foreground truncate">
                          {url.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {url.originalUrl}
                      </p>
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
            <CardTitle>Recent Clicks</CardTitle>
            <CardDescription>Latest activity on your links</CardDescription>
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
                    className="flex items-center justify-between"
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
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(stat.device)}
                      <span className="text-sm">
                        {stat.device || "Unknown"}
                      </span>
                    </div>
                    <Badge variant="secondary">{stat.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card hidden>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Clicks by geographic location</CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics?.countryStats || analytics.countryStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No location data</p>
            ) : (
              <div className="space-y-3">
                {analytics.countryStats.slice(0, 5).map((stat) => (
                  <div
                    key={stat.country}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">
                        {stat.country || "Unknown"}
                      </span>
                    </div>
                    <Badge variant="secondary">{stat.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
