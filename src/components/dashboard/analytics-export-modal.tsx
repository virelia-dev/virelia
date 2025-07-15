"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Download, FileText, Calendar, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportOption {
  id: "csv" | "pdf";
  name: string;
  description: string;
  icon: typeof FileText;
  format: string;
}

interface ExportModalProps {
  trigger?: React.ReactNode;
  totalClicks: number;
  totalUrls: number;
  dateRange: string;
}

const exportOptions: ExportOption[] = [
  {
    id: "csv",
    name: "CSV Export",
    description: "Spreadsheet-friendly format with all data points",
    icon: FileText,
    format: ".csv",
  },
  {
    id: "pdf",
    name: "PDF Report",
    description: "Professional report with charts and summaries",
    icon: FileText,
    format: ".pdf",
  },
];

export function AnalyticsExportModal({
  trigger,
  totalClicks = 0,
  totalUrls = 0,
  dateRange = "All time",
}: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);

  const handleExport = async (type: "csv" | "pdf") => {
    try {
      setExportingType(type);

      const response = await fetch(`/api/analytics/export?format=${type}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export analytics as ${type.toUpperCase()}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `virelia-analytics-${new Date().toISOString().split("T")[0]}.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `Analytics exported as ${type.toUpperCase()} successfully!`,
      );
      setIsOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export analytics",
      );
    } finally {
      setExportingType(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Export Analytics
          </DialogTitle>
          <DialogDescription>
            Download your analytics data in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{totalClicks}</div>
                    <div className="text-muted-foreground">Total Clicks</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{totalUrls}</div>
                    <div className="text-muted-foreground">Total URLs</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{dateRange}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isExporting = exportingType === option.id;

              return (
                <Card
                  key={option.id}
                  className="cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() => !isExporting && handleExport(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {option.name}
                            <Badge variant="outline" className="text-xs">
                              {option.format}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Download className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Exports include URL details, click analytics, geographic data, and
            device statistics
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
