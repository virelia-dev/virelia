"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FadeContainer } from "~/components/ui/animated";
import { memo, useCallback } from "react";

interface AdvancedFilters {
  dateRange: { start: string; end: string };
  clickRange: { min: string; max: string };
  sortBy: "createdAt" | "clicks" | "title";
  sortOrder: "asc" | "desc";
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  isVisible: boolean;
}

export const AdvancedFiltersPanel = memo(function AdvancedFiltersPanel({
  filters,
  onFiltersChange,
  isVisible,
}: AdvancedFiltersProps) {
  const updateFilters = useCallback(
    (updates: Partial<AdvancedFilters>) => {
      onFiltersChange({ ...filters, ...updates });
    },
    [filters, onFiltersChange],
  );

  const handleDateRangeChange = useCallback(
    (field: "start" | "end") => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFilters({
        dateRange: { ...filters.dateRange, [field]: e.target.value },
      });
    },
    [filters.dateRange, updateFilters],
  );

  const handleClickRangeChange = useCallback(
    (field: "min" | "max") => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFilters({
        clickRange: { ...filters.clickRange, [field]: e.target.value },
      });
    },
    [filters.clickRange, updateFilters],
  );

  const handleSortByChange = useCallback(
    (sortBy: AdvancedFilters["sortBy"]) => {
      updateFilters({ sortBy });
    },
    [updateFilters],
  );

  const handleSortOrderToggle = useCallback(() => {
    updateFilters({
      sortOrder: filters.sortOrder === "desc" ? "asc" : "desc",
    });
  }, [filters.sortOrder, updateFilters]);

  if (!isVisible) return null;

  return (
    <FadeContainer className="border-t pt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Date Range</label>
          <div className="space-y-2">
            <Input
              type="date"
              placeholder="Start date"
              value={filters.dateRange.start}
              onChange={handleDateRangeChange("start")}
              className="h-9"
            />
            <Input
              type="date"
              placeholder="End date"
              value={filters.dateRange.end}
              onChange={handleDateRangeChange("end")}
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
              value={filters.clickRange.min}
              onChange={handleClickRangeChange("min")}
              className="h-9"
            />
            <Input
              type="number"
              placeholder="Max clicks"
              value={filters.clickRange.max}
              onChange={handleClickRangeChange("max")}
              className="h-9"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Sort Options</label>
          <div className="space-y-2">
            <div className="flex gap-1">
              <Button
                variant={filters.sortBy === "createdAt" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-9"
                onClick={() => handleSortByChange("createdAt")}
              >
                Date
              </Button>
              <Button
                variant={filters.sortBy === "clicks" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-9"
                onClick={() => handleSortByChange("clicks")}
              >
                Clicks
              </Button>
            </div>
            <Button
              variant={filters.sortOrder === "desc" ? "default" : "outline"}
              size="sm"
              className="w-full h-9"
              onClick={handleSortOrderToggle}
            >
              {filters.sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </Button>
          </div>
        </div>
      </div>
    </FadeContainer>
  );
});
