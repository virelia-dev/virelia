"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Upload, Download, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BulkImportProps {
  onImportCompleteAction: () => void;
  className?: string;
}

interface BulkUrlData {
  originalUrl: string;
  title?: string;
  expiresAt?: string;
}

export function BulkUrlImport({
  onImportCompleteAction,
  className = "",
}: BulkImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent =
      "originalUrl,title,expiresAt\nhttps://example.com,Example Link,\nhttps://google.com,Google Homepage,2024-12-31T23:59:59";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-urls-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const parseCSV = (text: string): BulkUrlData[] => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    if (!headers.includes("originalUrl")) {
      throw new Error('CSV must include "originalUrl" column');
    }

    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: any = {};

        headers.forEach((header, index) => {
          if (values[index]) {
            row[header] = values[index];
          }
        });

        return row as BulkUrlData;
      })
      .filter((row) => row.originalUrl);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const urls = parseCSV(text);

      if (urls.length === 0) {
        throw new Error("No valid URLs found in the file");
      }

      if (urls.length > 100) {
        throw new Error("Maximum 100 URLs allowed per import");
      }

      const results = {
        total: urls.length,
        successful: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const urlData of urls) {
        try {
          const response = await fetch("/api/urls", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(urlData),
          });

          if (response.ok) {
            results.successful++;
          } else {
            results.failed++;
            const errorData = await response.json();
            results.errors.push(
              `${urlData.originalUrl}: ${errorData.error || "Unknown error"}`,
            );
          }
        } catch (importError) {
          results.failed++;
          results.errors.push(
            `${urlData.originalUrl}: ${importError instanceof Error ? importError.message : "Network error"}`,
          );
        }
      }

      setImportResults(results);

      if (results.successful > 0) {
        toast.success(`Successfully imported ${results.successful} URLs`);
        onImportCompleteAction();
      }

      if (results.failed > 0) {
        toast.error(`${results.failed} URLs failed to import`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process file",
      );
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk URL Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Import multiple URLs at once using a CSV file. Maximum 100 URLs per
          import.
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isLoading ? "Importing..." : "Choose CSV File"}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {importResults && (
          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="font-medium">Import Results</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-muted-foreground">Total</div>
                <div className="text-lg">{importResults.total}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-success">Successful</div>
                <div className="text-lg text-success">
                  {importResults.successful}
                </div>{" "}
              </div>
              <div className="text-center">
                <div className="font-medium text-destructive">Failed</div>
                <div className="text-lg text-destructive">
                  {importResults.failed}
                </div>{" "}
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
                  {" "}
                  <AlertCircle className="h-4 w-4" />
                  Errors:
                </div>
                <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {importResults.errors
                    .slice(0, 10)
                    .map((error: string, index: number) => (
                      <div key={index} className="text-destructive">
                        {" "}
                        {error}
                      </div>
                    ))}
                  {importResults.errors.length > 10 && (
                    <div className="text-muted-foreground">
                      ... and {importResults.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>CSV Format:</strong> Include columns for originalUrl
          (required), title (optional), and expiresAt (optional, ISO format).
        </div>
      </CardContent>
    </Card>
  );
}
