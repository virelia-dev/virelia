"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Copy, Check } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

interface CreateUrlFormProps {
  onUrlCreated?: (url: any) => void;
}

export function CreateUrlForm({ onUrlCreated }: CreateUrlFormProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          title: title || null,
          expiresAt: expiresAt || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create URL");
      }

      const newUrl = await response.json();
      setCreatedUrl(newUrl);
      setOriginalUrl("");
      setTitle("");
      setExpiresAt("");
      toast.success("Short URL created successfully!");
      onUrlCreated?.(newUrl);
    } catch (error) {
      console.error("Error creating URL:", error);
      toast.error(
        "Failed to create short URL. Please check the URL and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (createdUrl) {
      try {
        await navigator.clipboard.writeText(
          `${window.location.origin}/${createdUrl.shortCode}`,
        );
        setCopied(true);
        toast.success("URL copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy URL to clipboard");
        console.error("Copy to clipboard failed:", error);
      }
    }
  };

  const resetForm = () => {
    setCreatedUrl(null);
    setCopied(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Create Short URL
        </CardTitle>
        <CardDescription>
          Convert your long URLs into short, shareable links
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!createdUrl ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="originalUrl" className="text-sm font-medium ">
                URL to shorten *
              </label>
              <Input
                id="originalUrl"
                type="url"
                placeholder="https://example.com/very-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium ">
                Title (optional)
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Descriptive title for your link"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="expiresAt"
                className="text-sm font-medium flex items-center gap-2 "
              >
                Expiration (optional)
              </label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Short URL"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="font-medium text-accent mb-2">
                  URL Created Successfully!
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 p-2 bg-background rounded border">
                    <span className="text-sm font-mono break-all">
                      {window.location.origin}/{createdUrl.shortCode}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {createdUrl.title && (
                    <p className="text-sm text-muted-foreground">
                      {createdUrl.title}
                    </p>
                  )}
                  <div className="flex justify-center gap-2">
                    <Badge variant="secondary">
                      {createdUrl.expiresAt ? "Expires" : "Never expires"}
                    </Badge>
                    <Badge variant="outline">0 clicks</Badge>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={resetForm} variant="outline" className="w-full">
              Create Another URL
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
