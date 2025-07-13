"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

interface Url {
  id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  description?: string;
  tags?: string;
  isActive: boolean;
  expiresAt?: string;
  password?: string;
  clickLimit?: number;
  createdAt: string;
  domain?: {
    id: string;
    domain: string;
    isDefault: boolean;
  };
  _count?: {
    clicks: number;
  };
}

interface AdvancedFilters {
  dateRange: { start: string; end: string };
  clickRange: { min: string; max: string };
  sortBy: "createdAt" | "clicks" | "title";
  sortOrder: "asc" | "desc";
}

export function useUrls(refreshTrigger?: number) {
  const [urls, setUrls] = useState<Url[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUrls = useCallback(async () => {
    try {
      const response = await fetch("/api/urls");
      if (response.ok) {
        const data = await response.json();
        setUrls(data);
      }
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast.error("Failed to load URLs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls, refreshTrigger]);

  return { urls, isLoading, refetch: fetchUrls };
}

export function useUrlFiltering(urls: Url[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "expired" | "expiring" | "disabled"
  >("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    dateRange: { start: "", end: "" },
    clickRange: { min: "", max: "" },
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const isExpired = useCallback((expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  }, []);

  const isExpiringSoon = useCallback((expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysDiff = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return daysDiff > 0 && daysDiff <= 7;
  }, []);

  const filteredUrls = useMemo(() => {
    return urls
      .filter((url) => {
        const matchesSearch =
          url.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.tags?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "expired") {
          return url.expiresAt && isExpired(url.expiresAt);
        }
        if (filter === "expiring") {
          return (
            url.expiresAt &&
            isExpiringSoon(url.expiresAt) &&
            !isExpired(url.expiresAt)
          );
        }
        if (filter === "disabled") {
          return !url.isActive;
        }

        if (advancedFilters.dateRange.start) {
          const startDate = new Date(advancedFilters.dateRange.start);
          const urlDate = new Date(url.createdAt);
          if (urlDate < startDate) return false;
        }
        if (advancedFilters.dateRange.end) {
          const endDate = new Date(advancedFilters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          const urlDate = new Date(url.createdAt);
          if (urlDate > endDate) return false;
        }

        const clickCount = url._count?.clicks || 0;
        if (
          advancedFilters.clickRange.min &&
          clickCount < parseInt(advancedFilters.clickRange.min)
        ) {
          return false;
        }
        if (
          advancedFilters.clickRange.max &&
          clickCount > parseInt(advancedFilters.clickRange.max)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let aValue: any, bValue: any;

        switch (advancedFilters.sortBy) {
          case "clicks":
            aValue = a._count?.clicks || 0;
            bValue = b._count?.clicks || 0;
            break;
          case "title":
            aValue = (a.title || a.shortCode).toLowerCase();
            bValue = (b.title || b.shortCode).toLowerCase();
            break;
          default:
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
        }

        if (advancedFilters.sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [urls, searchQuery, filter, advancedFilters, isExpired, isExpiringSoon]);

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    advancedFilters,
    setAdvancedFilters,
    filteredUrls,
  };
}

export function useUrlSelection() {
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  const toggleUrlSelection = useCallback((urlId: string) => {
    setSelectedUrls((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(urlId)) {
        newSelected.delete(urlId);
      } else {
        newSelected.add(urlId);
      }
      return newSelected;
    });
  }, []);

  const selectAllUrls = useCallback((urlIds: string[]) => {
    setSelectedUrls(new Set(urlIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUrls(new Set());
  }, []);

  return {
    selectedUrls,
    toggleUrlSelection,
    selectAllUrls,
    clearSelection,
  };
}

export function useUrlActions(refetch: () => void) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = useCallback(
    async (shortCode: string, id: string, domain?: { domain: string }) => {
      try {
        const baseUrl = domain?.domain
          ? `https://${domain.domain}`
          : process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
        await navigator.clipboard.writeText(`${baseUrl}/${shortCode}`);
        setCopiedId(id);
        toast.success("URL copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
      } catch (error) {
        toast.error("Failed to copy URL to clipboard");
        console.error("Copy to clipboard failed:", error);
      }
    },
    [],
  );

  const toggleActiveStatus = useCallback(
    async (id: string, currentStatus: boolean) => {
      try {
        const response = await fetch(`/api/urls/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !currentStatus,
          }),
        });

        if (response.ok) {
          refetch();
          toast.success(
            `URL ${!currentStatus ? "activated" : "deactivated"} successfully!`,
          );
        } else {
          toast.error("Failed to update URL status");
        }
      } catch (error) {
        console.error("Error updating URL:", error);
        toast.error("Failed to update URL. Please try again.");
      }
    },
    [refetch],
  );

  const deleteUrl = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this URL?")) return;

      try {
        const response = await fetch(`/api/urls/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          refetch();
          toast.success("URL deleted successfully!");
        } else {
          toast.error("Failed to delete URL");
        }
      } catch (error) {
        console.error("Error deleting URL:", error);
        toast.error("Failed to delete URL. Please try again.");
      }
    },
    [refetch],
  );

  return {
    copiedId,
    copyToClipboard,
    toggleActiveStatus,
    deleteUrl,
  };
}
