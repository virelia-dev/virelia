"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Search,
  MoreHorizontal,
  BarChart3,
  Calendar,
  Link as LinkIcon,
  QrCode,
  X,
  Lock,
  Ban,
  CheckSquare,
  Square,
  Download,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { QRCodeComponent } from "~/components/ui/qr-code";
import { toast } from "sonner";
import Link from "next/link";

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

interface UrlListProps {
  refreshTrigger?: number;
}

export function UrlList({ refreshTrigger }: UrlListProps) {
  const [urls, setUrls] = useState<Url[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<Url | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "expired" | "expiring" | "disabled"
  >("all");
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: { start: "", end: "" },
    clickRange: { min: "", max: "" },
    tags: [] as string[],
    hasPassword: null as boolean | null,
    hasExpiry: null as boolean | null,
    sortBy: "createdAt" as "createdAt" | "clicks" | "title",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchUrls = async () => {
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
  };

  useEffect(() => {
    fetchUrls();
  }, [refreshTrigger]);

  const copyToClipboard = async (
    shortCode: string,
    id: string,
    domain?: { domain: string },
  ) => {
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
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
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
        fetchUrls();
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
  };

  const deleteUrl = async (id: string) => {
    if (!confirm("Are you sure you want to delete this URL?")) return;

    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUrls();
        toast.success("URL deleted successfully!");
      } else {
        toast.error("Failed to delete URL");
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("Failed to delete URL. Please try again.");
    }
  };

  const showQRCode = (shortCode: string) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${shortCode}`;
    setQrCodeUrl(fullUrl);
  };

  const closeQRCode = () => {
    setQrCodeUrl(null);
  };

  const openEditDialog = (url: Url) => {
    setEditingUrl(url);
  };

  const closeEditDialog = () => {
    setEditingUrl(null);
    setIsEditing(false);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUrl) return;

    setIsEditing(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const tags = formData.get("tags") as string;
      const expiresAt = formData.get("expiresAt") as string;

      const response = await fetch(`/api/urls/${editingUrl.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || null,
          description: description || null,
          tags: tags || null,
          expiresAt: expiresAt || null,
        }),
      });

      if (response.ok) {
        await fetchUrls();
        toast.success("URL updated successfully!");
        closeEditDialog();
      } else {
        toast.error("Failed to update URL");
      }
    } catch (error) {
      console.error("Error updating URL:", error);
      toast.error("Failed to update URL. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const filteredUrls = urls
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysDiff = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return daysDiff > 0 && daysDiff <= 7;
  };

  const getExpiryBadgeVariant = (expiresAt: string) => {
    if (isExpired(expiresAt)) return "destructive";
    if (isExpiringSoon(expiresAt)) return "secondary";
    return "outline";
  };

  const getExpiryText = (expiresAt: string) => {
    if (isExpired(expiresAt)) return "Expired";
    if (isExpiringSoon(expiresAt)) return "Expires soon";
    return `Expires ${formatDate(expiresAt)}`;
  };

  const isClickLimitReached = (url: Url) => {
    return url.clickLimit && (url._count?.clicks || 0) >= url.clickLimit;
  };

  const isDisabledDueToClickLimit = (url: Url) => {
    return !url.isActive && isClickLimitReached(url);
  };

  const toggleUrlSelection = (urlId: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(urlId)) {
      newSelected.delete(urlId);
    } else {
      newSelected.add(urlId);
    }
    setSelectedUrls(newSelected);
  };

  const selectAllUrls = () => {
    const newSelected = new Set(filteredUrls.map((url) => url.id));
    setSelectedUrls(newSelected);
  };

  const clearSelection = () => {
    setSelectedUrls(new Set());
  };

  const isAllSelected =
    filteredUrls.length > 0 && selectedUrls.size === filteredUrls.length;
  const isPartiallySelected =
    selectedUrls.size > 0 && selectedUrls.size < filteredUrls.length;

  const bulkDelete = async () => {
    if (selectedUrls.size === 0) return;

    if (
      !confirm(`Are you sure you want to delete ${selectedUrls.size} URL(s)?`)
    )
      return;

    setBulkOperationLoading(true);
    try {
      const promises = Array.from(selectedUrls).map((urlId) =>
        fetch(`/api/urls/${urlId}`, { method: "DELETE" }),
      );

      const results = await Promise.allSettled(promises);
      const failed = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failed === 0) {
        toast.success(`${selectedUrls.size} URL(s) deleted successfully!`);
      } else {
        toast.error(`Failed to delete ${failed} URL(s)`);
      }

      await fetchUrls();
      clearSelection();
    } catch (error) {
      console.error("Error deleting URLs:", error);
      toast.error("Failed to delete URLs. Please try again.");
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const bulkToggleActive = async (activate: boolean) => {
    if (selectedUrls.size === 0) return;

    setBulkOperationLoading(true);
    try {
      const promises = Array.from(selectedUrls).map((urlId) =>
        fetch(`/api/urls/${urlId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: activate }),
        }),
      );

      const results = await Promise.allSettled(promises);
      const failed = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failed === 0) {
        toast.success(
          `${selectedUrls.size} URL(s) ${activate ? "activated" : "deactivated"} successfully!`,
        );
      } else {
        toast.error(
          `Failed to ${activate ? "activate" : "deactivate"} ${failed} URL(s)`,
        );
      }

      await fetchUrls();
      clearSelection();
    } catch (error) {
      console.error("Error updating URLs:", error);
      toast.error("Failed to update URLs. Please try again.");
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const bulkExport = () => {
    if (selectedUrls.size === 0) return;

    const selectedUrlData = urls.filter((url) => selectedUrls.has(url.id));
    const csvContent = [
      [
        "Short Code",
        "Original URL",
        "Title",
        "Tags",
        "Active",
        "Clicks",
        "Created At",
        "Expires At",
      ].join(","),
      ...selectedUrlData.map((url) =>
        [
          url.shortCode,
          `"${url.originalUrl}"`,
          `"${url.title || ""}"`,
          `"${url.tags || ""}"`,
          url.isActive ? "Yes" : "No",
          url._count?.clicks || 0,
          new Date(url.createdAt).toISOString(),
          url.expiresAt ? new Date(url.expiresAt).toISOString() : "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `urls-export-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${selectedUrls.size} URL(s) to CSV`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your URLs</CardTitle>
          <CardDescription>Loading your shortened URLs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Your URLs ({urls.length})
        </CardTitle>
        <CardDescription>
          Manage and monitor your shortened URLs
        </CardDescription>

        {selectedUrls.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedUrls.size} URL(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkToggleActive(true)}
                disabled={bulkOperationLoading}
                className="h-8"
              >
                <Eye className="h-4 w-4 mr-1" />
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkToggleActive(false)}
                disabled={bulkOperationLoading}
                className="h-8"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={bulkExport}
                disabled={bulkOperationLoading}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={bulkDelete}
                disabled={bulkOperationLoading}
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                disabled={bulkOperationLoading}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-6.5 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search URLs by title, URL, short code, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="h-10 px-4 mt-1.5"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <div className="flex gap-1 mt-1.5">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="h-10 px-3"
            >
              All
            </Button>
            <Button
              variant={filter === "expiring" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("expiring")}
              className="h-10 px-3"
            >
              Expiring
            </Button>
            <Button
              variant={filter === "expired" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("expired")}
              className="h-10 px-3"
            >
              Expired
            </Button>
            <Button
              variant={filter === "disabled" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("disabled")}
              className="h-10 px-3"
            >
              Disabled
            </Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="border-t pt-4 space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Date Range</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={advancedFilters.dateRange.start}
                    onChange={(e) =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value },
                      }))
                    }
                    className="h-9"
                  />
                  <Input
                    type="date"
                    placeholder="End date"
                    value={advancedFilters.dateRange.end}
                    onChange={(e) =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value },
                      }))
                    }
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Click Count Range</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min clicks"
                    value={advancedFilters.clickRange.min}
                    onChange={(e) =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        clickRange: { ...prev.clickRange, min: e.target.value },
                      }))
                    }
                    className="h-9"
                  />
                  <Input
                    type="number"
                    placeholder="Max clicks"
                    value={advancedFilters.clickRange.max}
                    onChange={(e) =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        clickRange: { ...prev.clickRange, max: e.target.value },
                      }))
                    }
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Sort Options</label>
                <div className="space-y-2 mt-1.5">
                  <div className="flex gap-1">
                    <Button
                      variant={
                        advancedFilters.sortBy === "createdAt"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          sortBy: "createdAt",
                        }))
                      }
                    >
                      Date
                    </Button>
                    <Button
                      variant={
                        advancedFilters.sortBy === "clicks"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          sortBy: "clicks",
                        }))
                      }
                    >
                      Clicks
                    </Button>
                  </div>
                  <Button
                    variant={
                      advancedFilters.sortOrder === "desc"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="w-full h-9"
                    onClick={() =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
                      }))
                    }
                  >
                    {advancedFilters.sortOrder === "desc"
                      ? "Newest First"
                      : "Oldest First"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredUrls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {urls.length === 0 ? (
              <div className="space-y-2">
                <LinkIcon className="h-12 w-12 mx-auto opacity-20" />
                <p>No URLs created yet</p>
                <p className="text-sm">
                  Create your first short URL to get started
                </p>
              </div>
            ) : (
              <p>No URLs match your search</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUrls.length > 0 && (
              <div className="flex items-center gap-3 p-3 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isAllSelected ? clearSelection : selectAllUrls}
                  className="h-6 w-6 p-0"
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : isPartiallySelected ? (
                    <CheckSquare className="h-4 w-4 opacity-50" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm font-medium">
                  {isAllSelected ? "Deselect All" : "Select All"}
                </span>
              </div>
            )}

            {filteredUrls.map((url) => (
              <div
                key={url.id}
                className={`border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors ${
                  selectedUrls.has(url.id)
                    ? "ring-2 ring-primary/20 bg-accent/30"
                    : ""
                } ${
                  url.expiresAt && isExpired(url.expiresAt)
                    ? "border-destructive/50 bg-destructive/5"
                    : url.expiresAt && isExpiringSoon(url.expiresAt)
                      ? "border-secondary/50 bg-secondary/5"
                      : isDisabledDueToClickLimit(url)
                        ? "border-destructive/30 bg-destructive/5 opacity-75"
                        : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUrlSelection(url.id)}
                      className="h-6 w-6 p-0 mt-1"
                    >
                      {selectedUrls.has(url.id) ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm bg-popover px-2 py-1 rounded border">
                          {url.domain?.domain
                            ? `${url.domain.domain}`
                            : process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(
                                "https://",
                                "",
                              )}
                          /{url.shortCode}
                        </span>{" "}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(url.shortCode, url.id, url.domain)
                          }
                          className="h-6 w-6 p-0"
                        >
                          {copiedId === url.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-6 w-6 p-0"
                        >
                          <a
                            href={url.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>

                      {url.title && (
                        <h3 className="font-medium text-sm">{url.title}</h3>
                      )}

                      {url.tags && (
                        <div className="flex gap-1 flex-wrap">
                          {url.tags
                            .split(",")
                            .filter((tag) => tag.trim())
                            .map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag.trim()}
                              </Badge>
                            ))}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground break-all">
                        {url.originalUrl}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => showQRCode(url.shortCode)}
                        className="flex items-center gap-2"
                      >
                        <QrCode className="h-4 w-4" />
                        Show QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <Link href={`/dashboard/analytics/${url.id}`}>
                          View Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openEditDialog(url)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleActiveStatus(url.id, url.isActive)}
                        className="flex items-center gap-2"
                      >
                        {url.isActive
                          ? "Deactivate"
                          : isDisabledDueToClickLimit(url)
                            ? "Reactivate (Reset Click Limit)"
                            : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteUrl(url.id)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={url.isActive ? "default" : "destructive"}>
                      {url.isActive
                        ? "Active"
                        : isDisabledDueToClickLimit(url)
                          ? "Disabled (Click Limit)"
                          : "Inactive"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <BarChart3 className="h-3 w-3" />
                      {url._count?.clicks || 0}
                      {url.clickLimit ? ` / ${url.clickLimit}` : ""}
                    </Badge>
                    {url.password && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3" />
                      </Badge>
                    )}
                    {url.clickLimit && isClickLimitReached(url) && (
                      <Badge variant="destructive" className="text-xs">
                        <Ban className="h-3 w-3" />
                      </Badge>
                    )}
                    {url.expiresAt && (
                      <Badge
                        variant={getExpiryBadgeVariant(url.expiresAt)}
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        {getExpiryText(url.expiresAt)}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created {formatDate(url.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {qrCodeUrl && (
        <div className="fixed inset-0 bg-card flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">QR Code</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeQRCode}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center">
              <QRCodeComponent value={qrCodeUrl} size={200} />
            </div>
          </div>
        </div>
      )}

      {editingUrl && (
        <div className="fixed inset-0 bg-card flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit URL</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeEditDialog}
                className="h-8 w-8 p-0"
                disabled={isEditing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Code</label>
                <Input
                  value={editingUrl.shortCode}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Short codes cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Original URL</label>
                <Input
                  value={editingUrl.originalUrl}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Original URL cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title (Optional)</label>
                <Input
                  name="title"
                  defaultValue={editingUrl.title || ""}
                  placeholder="Descriptive title for your link"
                  disabled={isEditing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Input
                  name="description"
                  defaultValue={editingUrl.description || ""}
                  placeholder="Brief description of the link"
                  disabled={isEditing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (Optional)</label>
                <Input
                  name="tags"
                  defaultValue={editingUrl.tags || ""}
                  placeholder="work, marketing, social (comma-separated)"
                  disabled={isEditing}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expires At (Optional)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date();
                        date.setHours(date.getHours() + 24);
                        const input = document.querySelector(
                          'input[name="expiresAt"]',
                        ) as HTMLInputElement;
                        if (input)
                          input.value = date.toISOString().slice(0, 16);
                      }}
                      disabled={isEditing}
                    >
                      24h
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() + 7);
                        const input = document.querySelector(
                          'input[name="expiresAt"]',
                        ) as HTMLInputElement;
                        if (input)
                          input.value = date.toISOString().slice(0, 16);
                      }}
                      disabled={isEditing}
                    >
                      1 week
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date();
                        date.setMonth(date.getMonth() + 1);
                        const input = document.querySelector(
                          'input[name="expiresAt"]',
                        ) as HTMLInputElement;
                        if (input)
                          input.value = date.toISOString().slice(0, 16);
                      }}
                      disabled={isEditing}
                    >
                      1 month
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.querySelector(
                          'input[name="expiresAt"]',
                        ) as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                      disabled={isEditing}
                    >
                      Never
                    </Button>
                  </div>
                  <Input
                    name="expiresAt"
                    type="datetime-local"
                    defaultValue={
                      editingUrl.expiresAt
                        ? new Date(editingUrl.expiresAt)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    disabled={isEditing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank for no expiration
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditDialog}
                  disabled={isEditing}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditing}>
                  {isEditing ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
