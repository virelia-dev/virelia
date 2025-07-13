"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { LinkIcon, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "motion/react";

import {
  useUrls,
  useUrlFiltering,
  useUrlSelection,
  useUrlActions,
} from "~/hooks/use-urls";
import { useBulkOperations } from "~/hooks/use-bulk-operations";

import { UrlFilters } from "./url-filters";
import { AdvancedFiltersPanel } from "./advanced-filters";
import { BulkOperationsToolbar } from "./bulk-operations-toolbar";
import { UrlItem } from "./url-item";
import { UrlListSkeleton } from "./url-list-skeleton";
import {
  AnimatedPage,
  StaggerContainer,
  FadeContainer,
  AnimatedButton,
} from "~/components/ui/animated";

import { EditUrlModal } from "./edit-url-modal";
import { QRCodeModal } from "./qr-code-modal";

interface UrlListProps {
  refreshTrigger?: number;
}

export function UrlList({ refreshTrigger }: UrlListProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<any>(null);
  const { urls, isLoading, refetch } = useUrls(refreshTrigger);
  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    advancedFilters,
    setAdvancedFilters,
    filteredUrls,
  } = useUrlFiltering(urls);
  const { selectedUrls, toggleUrlSelection, selectAllUrls, clearSelection } =
    useUrlSelection();
  const { copiedId, copyToClipboard, toggleActiveStatus, deleteUrl } =
    useUrlActions(refetch);
  const { bulkOperationLoading, bulkDelete, bulkToggleActive, bulkExport } =
    useBulkOperations(urls, selectedUrls, refetch, clearSelection);

  const handleToggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters((prev) => !prev);
  }, []);

  const handleShowQRCode = useCallback((shortCode: string) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${shortCode}`;
    setQrCodeUrl(fullUrl);
  }, []);

  const handleCloseQRCode = useCallback(() => {
    setQrCodeUrl(null);
  }, []);

  const handleOpenEditDialog = useCallback((url: any) => {
    setEditingUrl(url);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditingUrl(null);
  }, []);

  const handleEditSubmit = useCallback(
    async (updatedData: any) => {
      if (!editingUrl) return;

      try {
        const response = await fetch(`/api/urls/${editingUrl.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          refetch();
          toast.success("URL updated successfully!");
          handleCloseEditDialog();
        } else {
          toast.error("Failed to update URL");
        }
      } catch (error) {
        console.error("Error updating URL:", error);
        toast.error("Failed to update URL. Please try again.");
      }
    },
    [editingUrl, refetch, handleCloseEditDialog],
  );

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllUrls(filteredUrls.map((url) => url.id));
    }
  }, [filteredUrls, selectAllUrls, clearSelection]);

  const isAllSelected = useMemo(
    () => filteredUrls.length > 0 && selectedUrls.size === filteredUrls.length,
    [filteredUrls.length, selectedUrls.size],
  );

  const isPartiallySelected = useMemo(
    () => selectedUrls.size > 0 && selectedUrls.size < filteredUrls.length,
    [selectedUrls.size, filteredUrls.length],
  );

  if (isLoading) {
    return <UrlListSkeleton />;
  }

  return (
    <AnimatedPage>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Your URLs ({urls.length})
          </CardTitle>
          <CardDescription>
            Manage and monitor your shortened URLs
          </CardDescription>

          <BulkOperationsToolbar
            selectedCount={selectedUrls.size}
            isLoading={bulkOperationLoading}
            onActivate={() => bulkToggleActive(true)}
            onDeactivate={() => bulkToggleActive(false)}
            onExport={bulkExport}
            onDelete={bulkDelete}
            onClearSelection={clearSelection}
          />

          <UrlFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            onToggleAdvancedFilters={handleToggleAdvancedFilters}
          />

          <AdvancedFiltersPanel
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            isVisible={showAdvancedFilters}
          />
        </CardHeader>

        <CardContent>
          {filteredUrls.length === 0 ? (
            <FadeContainer className="text-center py-8 text-muted-foreground">
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
            </FadeContainer>
          ) : (
            <StaggerContainer className="space-y-4">
              {filteredUrls.length > 0 && (
                <FadeContainer className="flex items-center gap-3 p-3 border-b">
                  <AnimatedButton>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
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
                  </AnimatedButton>
                  <span className="text-sm font-medium">
                    {isAllSelected ? "Deselect All" : "Select All"}
                  </span>
                </FadeContainer>
              )}

              {filteredUrls.map((url) => (
                <UrlItem
                  key={url.id}
                  url={url}
                  isSelected={selectedUrls.has(url.id)}
                  isCopied={copiedId === url.id}
                  onToggleSelection={toggleUrlSelection}
                  onCopy={copyToClipboard}
                  onShowQRCode={handleShowQRCode}
                  onEdit={handleOpenEditDialog}
                  onToggleActive={toggleActiveStatus}
                  onDelete={deleteUrl}
                />
              ))}
            </StaggerContainer>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {qrCodeUrl && (
          <QRCodeModal url={qrCodeUrl} onClose={handleCloseQRCode} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUrl && (
          <EditUrlModal
            url={editingUrl}
            onSubmit={handleEditSubmit}
            onClose={handleCloseEditDialog}
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
