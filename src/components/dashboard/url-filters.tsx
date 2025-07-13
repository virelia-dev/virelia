"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { AnimatedButton, FadeContainer } from "~/components/ui/animated";
import { memo, useCallback } from "react";

interface UrlFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: "all" | "expired" | "expiring" | "disabled";
  onFilterChange: (filter: "all" | "expired" | "expiring" | "disabled") => void;
  onToggleAdvancedFilters: () => void;
}

export const UrlFilters = memo(function UrlFilters({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onToggleAdvancedFilters,
}: UrlFiltersProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange],
  );

  const handleFilterClick = useCallback(
    (filterType: typeof filter) => {
      onFilterChange(filterType);
    },
    [onFilterChange],
  );

  return (
    <FadeContainer className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search URLs by title, URL, short code, or tags..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-9 h-10"
        />
      </div>

      <AnimatedButton>
        <Button
          variant="outline"
          onClick={onToggleAdvancedFilters}
          className="h-10 px-4"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </AnimatedButton>

      <div className="flex gap-1">
        {(["all", "expiring", "expired", "disabled"] as const).map(
          (filterType) => (
            <AnimatedButton key={filterType}>
              <Button
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterClick(filterType)}
                className="h-10 px-3 capitalize"
              >
                {filterType}
              </Button>
            </AnimatedButton>
          ),
        )}
      </div>
    </FadeContainer>
  );
});
