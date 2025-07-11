import type { Metadata } from "next";
import { AnalyticsOverview } from "~/components/dashboard/analytics-overview";

export const metadata: Metadata = {
  title: "Analytics - Virelia",
  description: "View detailed analytics for your shortened URLs",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights and statistics for your shortened URLs
        </p>
      </div>
      <AnalyticsOverview />
    </div>
  );
}
