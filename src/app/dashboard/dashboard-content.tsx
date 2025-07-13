"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { User } from "better-auth/types";
import { Skeleton } from "~/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Link as LinkIcon, TrendingUp, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { CreateUrlForm } from "~/components/dashboard/create-url-form";
import { UrlList } from "~/components/dashboard/url-list";
import { AnalyticsDashboard } from "~/components/dashboard/analytics-dashboard";
import { StatsCards } from "~/components/dashboard/stats-cards";
import { MobileNav } from "~/components/dashboard/mobile-nav";
import { DesktopTabs } from "~/components/dashboard/desktop-tabs";
import { BulkUrlImport } from "~/components/dashboard/bulk-url-import";
import { DomainManagement } from "~/components/dashboard/domain-management";
import { toast } from "sonner";

export function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshUrlList, setRefreshUrlList] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

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
    router.push("/dashboard?tab=manage");
  };

  const handleBulkImportComplete = () => {
    setRefreshUrlList((prev) => prev + 1);
  };

  const handleTabChange = (tab: string) => {
    const url = new URL(window.location.href);
    if (tab === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    router.push(url.pathname + url.search);
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
      <motion.div
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8 space-y-6">
          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-96" />
          </motion.div>
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="border rounded-lg p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
              >
                <Skeleton className="h-32 w-full" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MobileNav activeTab={activeTab} onTabChangeAction={handleTabChange} />

      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8 max-w-7xl">
        <motion.div
          className="space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="space-y-2 pt-16 md:pt-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}!
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <DesktopTabs
              activeTab={activeTab}
              onTabChangeAction={handleTabChange}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <StatsCards stats={overviewStats} />
                <CreateUrlForm onUrlCreated={handleUrlCreated} />
              </motion.div>
            )}

            {activeTab === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <CreateUrlForm onUrlCreated={handleUrlCreated} />
              </motion.div>
            )}

            {activeTab === "import" && (
              <motion.div
                key="import"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <BulkUrlImport
                  onImportCompleteAction={handleBulkImportComplete}
                />
              </motion.div>
            )}

            {activeTab === "manage" && (
              <motion.div
                key="manage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <UrlList refreshTrigger={refreshUrlList} />
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <AnalyticsDashboard />
              </motion.div>
            )}

            {activeTab === "domains" && (
              <motion.div
                key="domains"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <DomainManagement />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
