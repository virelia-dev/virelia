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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { QRCodeComponent } from "~/components/ui/qr-code";
import { toast } from "sonner";

interface Url {
  id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
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

  const copyToClipboard = async (shortCode: string, id: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${shortCode}`
      );
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
          `URL ${!currentStatus ? "activated" : "deactivated"} successfully!`
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
    const fullUrl = `${window.location.origin}/${shortCode}`;
    setQrCodeUrl(fullUrl);
  };

  const closeQRCode = () => {
    setQrCodeUrl(null);
  };

  const filteredUrls = urls.filter(
    (url) =>
      url.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search URLs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
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
            {filteredUrls.map((url) => (
              <div
                key={url.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm bg-popover px-2 py-1 rounded border">
                        {window.location.origin}/{url.shortCode}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(url.shortCode, url.id)}
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

                    <p className="text-sm text-muted-foreground break-all">
                      {url.originalUrl}
                    </p>
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
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleActiveStatus(url.id, url.isActive)}
                        className="flex items-center gap-2"
                      >
                        {url.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteUrl(url.id)}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={url.isActive ? "default" : "secondary"}>
                      {url.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <BarChart3 className="h-3 w-3" />
                      {url._count?.clicks || 0} clicks
                    </Badge>
                    {url.expiresAt && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        Expires {formatDate(url.expiresAt)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
    </Card>
  );
}
