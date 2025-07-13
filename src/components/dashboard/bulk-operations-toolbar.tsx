"use client";

import { Button } from "~/components/ui/button";
import { Eye, EyeOff, Download, Trash2, X } from "lucide-react";
import { AnimatedButton, FadeContainer } from "~/components/ui/animated";
import { memo, useCallback } from "react";

interface BulkOperationsToolbarProps {
  selectedCount: number;
  isLoading: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const BulkOperationsToolbar = memo(function BulkOperationsToolbar({
  selectedCount,
  isLoading,
  onActivate,
  onDeactivate,
  onExport,
  onDelete,
  onClearSelection,
}: BulkOperationsToolbarProps) {
  const handleActivate = useCallback(() => {
    onActivate();
  }, [onActivate]);

  const handleDeactivate = useCallback(() => {
    onDeactivate();
  }, [onDeactivate]);

  const handleExport = useCallback(() => {
    onExport();
  }, [onExport]);

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  const handleClearSelection = useCallback(() => {
    onClearSelection();
  }, [onClearSelection]);

  if (selectedCount === 0) return null;

  return (
    <FadeContainer className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount} URL(s) selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <AnimatedButton disabled={isLoading}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleActivate}
            disabled={isLoading}
            className="h-8"
          >
            <Eye className="h-4 w-4 mr-1" />
            Activate
          </Button>
        </AnimatedButton>

        <AnimatedButton disabled={isLoading}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDeactivate}
            disabled={isLoading}
            className="h-8"
          >
            <EyeOff className="h-4 w-4 mr-1" />
            Deactivate
          </Button>
        </AnimatedButton>

        <AnimatedButton disabled={isLoading}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={isLoading}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </AnimatedButton>

        <AnimatedButton disabled={isLoading}>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </AnimatedButton>

        <AnimatedButton disabled={isLoading}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearSelection}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </AnimatedButton>
      </div>
    </FadeContainer>
  );
});
