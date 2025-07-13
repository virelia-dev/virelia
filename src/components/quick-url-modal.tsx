"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Copy, Check, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface QuickUrlModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onUrlCreated?: (url: any) => void;
}

export function QuickUrlModal({
  isOpen,
  onCloseAction,
  onUrlCreated,
}: QuickUrlModalProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setOriginalUrl("");
      setTitle("");
      setCreatedUrl(null);
      setCopied(false);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          title: title || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create URL");
      }

      const newUrl = await response.json();
      setCreatedUrl(newUrl);
      toast.success("Short URL created successfully!");
      onUrlCreated?.(newUrl);
    } catch (error) {
      console.error("Error creating URL:", error);
      setError(
        "Failed to create short URL. Please check the URL and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (createdUrl) {
      try {
        const shortUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${createdUrl.shortCode}`;
        await navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        toast.success("URL copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy URL to clipboard");
        console.error("Copy to clipboard failed:", error);
      }
    }
  };

  const handleCreateAnother = () => {
    setOriginalUrl("");
    setTitle("");
    setCreatedUrl(null);
    setCopied(false);
    setError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const shortUrl = createdUrl
    ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${createdUrl.shortCode}`
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Zap className="h-5 w-5 text-primary" />
            </motion.div>
            Quick URL Creation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!createdUrl ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="quick-url" className="text-sm font-medium">
                      URL to shorten *
                    </label>
                    <Input
                      ref={inputRef}
                      id="quick-url"
                      type="url"
                      placeholder="https://example.com/very-long-url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="quick-title"
                      className="text-sm font-medium"
                    >
                      Title (optional)
                    </label>
                    <Input
                      id="quick-title"
                      type="text"
                      placeholder="Descriptive title for your link"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCloseAction}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                    <h3 className="font-semibold mb-3 text-primary">
                      URL Created! 🎉
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-background rounded border">
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
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      {createdUrl.title && (
                        <p className="text-sm text-muted-foreground">
                          {createdUrl.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onCloseAction}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button onClick={handleCreateAnother} className="flex-1">
                    Create Another
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
