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
import { Copy, Check, Settings, QrCode, Zap } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { QRCodeComponent } from "~/components/ui/qr-code";
import { UTMBuilder } from "./utm-builder";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface CreateUrlFormProps {
  onUrlCreated?: (url: any) => void;
}

export function CreateUrlForm({ onUrlCreated }: CreateUrlFormProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showUTMBuilder, setShowUTMBuilder] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

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
          tags: tags || null,
          expiresAt: expiresAt || null,
          password: password || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create URL");
      }

      const newUrl = await response.json();
      setCreatedUrl(newUrl);
      setOriginalUrl("");
      setTitle("");
      setTags("");
      setExpiresAt("");
      setPassword("");
      setShowAdvanced(false);
      setShowUTMBuilder(false);
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
          `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${createdUrl.shortCode}`,
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
    setShowQRCode(false);
  };

  const handleUtmUpdate = (newUrl: string) => {
    setOriginalUrl(newUrl);
  };

  const shortUrl = createdUrl
    ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${createdUrl.shortCode}`
    : "";

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-border/50 hover:border-border transition-colors duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Zap className="h-5 w-5 text-primary" />
            </motion.div>
            Create Short URL
          </CardTitle>
          <CardDescription>
            Convert your long URLs into short, shareable links with advanced
            features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {!createdUrl ? (
              <motion.div
                key="form"
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="originalUrl"
                      className="text-sm font-medium"
                    >
                      URL to shorten *
                    </label>
                    <Input
                      id="originalUrl"
                      type="url"
                      placeholder="https://example.com/very-long-url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUTMBuilder(!showUTMBuilder)}
                      className="flex items-center gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      UTM Builder
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      Advanced Options
                    </Button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">
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
                        <label htmlFor="tags" className="text-sm font-medium">
                          Tags (optional)
                        </label>
                        <Input
                          id="tags"
                          type="text"
                          placeholder="work, marketing, social (comma-separated)"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Separate multiple tags with commas
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          Password Protection (optional)
                        </label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Protect your link with a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="expiresAt"
                          className="text-sm font-medium"
                        >
                          Expiration (optional)
                        </label>
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date();
                                date.setHours(date.getHours() + 24);
                                setExpiresAt(date.toISOString().slice(0, 16));
                              }}
                            >
                              24h
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 7);
                                setExpiresAt(date.toISOString().slice(0, 16));
                              }}
                            >
                              1 week
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date();
                                date.setMonth(date.getMonth() + 1);
                                setExpiresAt(date.toISOString().slice(0, 16));
                              }}
                            >
                              1 month
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setExpiresAt("")}
                            >
                              Never
                            </Button>
                          </div>
                          <Input
                            id="expiresAt"
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Creating..." : "Create Short URL"}
                  </Button>
                </form>

                {showUTMBuilder && originalUrl && (
                  <UTMBuilder
                    baseUrl={originalUrl}
                    onUrlUpdateAction={handleUtmUpdate}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className="space-y-6"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-center space-y-4">
                  <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-4 text-primary">
                      URL Created Successfully! 🎉
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 p-3 bg-background rounded-lg border">
                        <span className="text-sm font-mono break-all flex-1">
                          {shortUrl}
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
                        <p className="text-sm text-muted-foreground font-medium">
                          {createdUrl.title}
                        </p>
                      )}

                      <div className="flex justify-center gap-2 flex-wrap">
                        <Badge variant="secondary">
                          {createdUrl.expiresAt ? "Expires" : "Never expires"}
                        </Badge>
                        <Badge variant="outline">0 clicks</Badge>
                        {password && (
                          <Badge variant="destructive">
                            Password Protected
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQRCode(!showQRCode)}
                          className="flex items-center gap-1"
                        >
                          <QrCode className="h-4 w-4" />
                          {showQRCode ? "Hide" : "Show"} QR Code
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showQRCode && (
                    <motion.div
                      className="flex justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <QRCodeComponent value={shortUrl} size={200} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="w-full transition-all duration-200"
                  >
                    Create Another URL
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
