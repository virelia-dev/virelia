import type { Metadata } from "next";
import { UrlAnalyticsDetail } from "~/components/dashboard/url-analytics-detail";

export const metadata: Metadata = {
  title: "URL Analytics - Virelia",
  description: "Detailed analytics for a specific shortened URL",
};

export default async function UrlAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UrlAnalyticsDetail urlId={id} />;
}
