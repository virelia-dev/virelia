"use client";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  MoreHorizontal,
  BarChart3,
  Calendar,
  QrCode,
  Lock,
  Ban,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AnimatedButton,
  StaggerItem,
  AnimatedIcon,
} from "~/components/ui/animated";
import { memo, useCallback } from "react";
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

interface UrlItemProps {
  url: Url;
  isSelected: boolean;
  isCopied: boolean;
  onToggleSelection: (urlId: string) => void;
  onCopy: (shortCode: string, id: string, domain?: { domain: string }) => void;
  onShowQRCode: (shortCode: string) => void;
  onEdit: (url: Url) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export const UrlItem = memo(function UrlItem({
  url,
  isSelected,
  isCopied,
  onToggleSelection,
  onCopy,
  onShowQRCode,
  onEdit,
  onToggleActive,
  onDelete,
}: UrlItemProps) {
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const isExpired = useCallback((expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  }, []);

  const isExpiringSoon = useCallback((expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysDiff = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return daysDiff > 0 && daysDiff <= 7;
  }, []);

  const getExpiryBadgeVariant = useCallback(
    (expiresAt: string) => {
      if (isExpired(expiresAt)) return "destructive";
      if (isExpiringSoon(expiresAt)) return "secondary";
      return "outline";
    },
    [isExpired, isExpiringSoon],
  );

  const getExpiryText = useCallback(
    (expiresAt: string) => {
      if (isExpired(expiresAt)) return "Expired";
      if (isExpiringSoon(expiresAt)) return "Expires soon";
      return `Expires ${formatDate(expiresAt)}`;
    },
    [isExpired, isExpiringSoon, formatDate],
  );

  const isClickLimitReached = useCallback((url: Url) => {
    return url.clickLimit && (url._count?.clicks || 0) >= url.clickLimit;
  }, []);

  const isDisabledDueToClickLimit = useCallback(
    (url: Url) => {
      return !url.isActive && isClickLimitReached(url);
    },
    [isClickLimitReached],
  );

  const handleToggleSelection = useCallback(() => {
    onToggleSelection(url.id);
  }, [onToggleSelection, url.id]);

  const handleCopy = useCallback(() => {
    onCopy(url.shortCode, url.id, url.domain);
  }, [onCopy, url.shortCode, url.id, url.domain]);

  const handleShowQRCode = useCallback(() => {
    onShowQRCode(url.shortCode);
  }, [onShowQRCode, url.shortCode]);

  const handleEdit = useCallback(() => {
    onEdit(url);
  }, [onEdit, url]);

  const handleToggleActive = useCallback(() => {
    onToggleActive(url.id, url.isActive);
  }, [onToggleActive, url.id, url.isActive]);

  const handleDelete = useCallback(() => {
    onDelete(url.id);
  }, [onDelete, url.id]);

  const cardClassName = `border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors ${
    isSelected ? "ring-2 ring-primary/20 bg-accent/30" : ""
  } ${
    url.expiresAt && isExpired(url.expiresAt)
      ? "border-destructive/50 bg-destructive/5"
      : url.expiresAt && isExpiringSoon(url.expiresAt)
        ? "border-secondary/50 bg-secondary/5"
        : isDisabledDueToClickLimit(url)
          ? "border-destructive/30 bg-destructive/5 opacity-75"
          : ""
  }`;

  return (
    <StaggerItem className={cardClassName}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AnimatedButton>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSelection}
              className="h-6 w-6 p-0 mt-1"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </Button>
          </AnimatedButton>

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
              </span>

              <AnimatedButton>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0"
                >
                  <AnimatedIcon>
                    {isCopied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </AnimatedIcon>
                </Button>
              </AnimatedButton>

              <AnimatedButton>
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
                    <AnimatedIcon>
                      <ExternalLink className="h-3 w-3" />
                    </AnimatedIcon>
                  </a>
                </Button>
              </AnimatedButton>
            </div>

            {url.title && <h3 className="font-medium text-sm">{url.title}</h3>}

            {url.tags && (
              <div className="flex gap-1 flex-wrap">
                {url.tags
                  .split(",")
                  .filter((tag) => tag.trim())
                  .map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
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
            <AnimatedButton>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </AnimatedButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleShowQRCode}
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
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleToggleActive}
              className="flex items-center gap-2"
            >
              {url.isActive
                ? "Deactivate"
                : isDisabledDueToClickLimit(url)
                  ? "Reactivate (Reset Click Limit)"
                  : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
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
          <Badge variant="outline" className="flex items-center gap-1">
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
    </StaggerItem>
  );
});
