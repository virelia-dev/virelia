"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export interface AnalyticsData {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  topUrls: Array<{
    id: string;
    shortCode: string;
    originalUrl: string;
    title: string | null;
    clicks: number;
  }>;
  recentClicks: Array<{
    id: string;
    shortCode: string;
    country: string | null;
    device: string | null;
    browser: string | null;
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

export function useRealTimeAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analytics");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      toast.error("Failed to fetch analytics data");
      setError("Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
