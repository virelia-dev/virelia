"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { StaggerContainer, StaggerItem } from "~/components/ui/animated";
import { memo } from "react";

export const UrlListSkeleton = memo(function UrlListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-primary/10 rounded animate-pulse mb-2" />
        <div className="h-4 bg-primary/10 rounded animate-pulse w-2/3" />
      </CardHeader>
      <CardContent>
        <StaggerContainer className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <StaggerItem
              key={i}
              className="h-20 bg-primary/10 rounded animate-pulse"
            />
          ))}
        </StaggerContainer>
      </CardContent>
    </Card>
  );
});
