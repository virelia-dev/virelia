"use client";

import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { User } from "better-auth/types";
import { Skeleton } from "~/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Link as LinkIcon, TrendingUp, Calendar } from "lucide-react";

import { CreateUrlForm } from "~/components/dashboard/create-url-form";
import { UrlList } from "~/components/dashboard/url-list";
import { AnalyticsDashboard } from "~/components/dashboard/analytics-dashboard";
import { StatsCards } from "~/components/dashboard/stats-cards";
import { MobileNav } from "~/components/dashboard/mobile-nav";
import { DesktopTabs } from "~/components/dashboard/desktop-tabs";
import { BulkUrlImport } from "~/components/dashboard/bulk-url-import";
import { toast } from "sonner";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshUrlList, setRefreshUrlList] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
        } else {
          redirect("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Failed to check authentication status");
        setUser(null);
        redirect("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      setAnalyticsLoading(true);
      try {
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          throw new Error("Failed to fetch analytics");
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, refreshUrlList]);

  const handleUrlCreated = () => {
    setRefreshUrlList((prev) => prev + 1);
    setActiveTab("manage");
  };

  const handleBulkImportComplete = () => {
    setRefreshUrlList((prev) => prev + 1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const overviewStats = [
    {
      title: "Total URLs",
      value: analyticsLoading ? "—" : analytics?.totalUrls || 0,
      description: "All shortened URLs",
      icon: LinkIcon,
    },
    {
      title: "Total Clicks",
      value: analyticsLoading ? "—" : analytics?.totalClicks || 0,
      description: "All time clicks",
      icon: TrendingUp,
    },
    {
      title: "This Month",
      value: analyticsLoading ? "—" : analytics?.clicksThisMonth || 0,
      description: "Clicks this month",
      icon: Calendar,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNav activeTab={activeTab} onTabChangeAction={handleTabChange} />

      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-6">
          <div className="space-y-2 pt-16 md:pt-0">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}!
            </p>
          </div>

          <DesktopTabs
            activeTab={activeTab}
            onTabChangeAction={handleTabChange}
          />

          {activeTab === "overview" && (
            <div className="space-y-6">
              <StatsCards stats={overviewStats} />
              <CreateUrlForm onUrlCreated={handleUrlCreated} />
            </div>
          )}

          {activeTab === "create" && (
            <div>
              <CreateUrlForm onUrlCreated={handleUrlCreated} />
            </div>
          )}

          {activeTab === "import" && (
            <div>
              <BulkUrlImport
                onImportCompleteAction={handleBulkImportComplete}
              />
            </div>
          )}

          {activeTab === "manage" && (
            <UrlList refreshTrigger={refreshUrlList} />
          )}

          {activeTab === "analytics" && <AnalyticsDashboard />}
        </div>
      </div>
    </div>
  );
}
