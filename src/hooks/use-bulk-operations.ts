"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface Url {
  id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  tags?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    clicks: number;
  };
}

export function useBulkOperations(
  urls: Url[],
  selectedUrls: Set<string>,
  refetch: () => void,
  clearSelection: () => void,
) {
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);

  const bulkDelete = useCallback(async () => {
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

      refetch();
      clearSelection();
    } catch (error) {
      console.error("Error deleting URLs:", error);
      toast.error("Failed to delete URLs. Please try again.");
    } finally {
      setBulkOperationLoading(false);
    }
  }, [selectedUrls, refetch, clearSelection]);

  const bulkToggleActive = useCallback(
    async (activate: boolean) => {
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

        refetch();
        clearSelection();
      } catch (error) {
        console.error("Error updating URLs:", error);
        toast.error("Failed to update URLs. Please try again.");
      } finally {
        setBulkOperationLoading(false);
      }
    },
    [selectedUrls, refetch, clearSelection],
  );

  const bulkExport = useCallback(() => {
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
  }, [selectedUrls, urls]);

  return {
    bulkOperationLoading,
    bulkDelete,
    bulkToggleActive,
    bulkExport,
  };
}
