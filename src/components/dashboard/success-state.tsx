"use client";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Copy, Check, QrCode } from "lucide-react";
import { QRCodeComponent } from "~/components/ui/qr-code";
import { useState, useCallback, memo } from "react";
import { AnimatePresence } from "motion/react";
import {
  FadeContainer,
  AnimatedButton,
  AnimatedIcon,
} from "~/components/ui/animated";

interface SuccessStateProps {
  url: any;
  password: string;
  clickLimit: string;
  onReset: () => void;
}

export const SuccessState = memo(function SuccessState({
  url,
  password,
  clickLimit,
  onReset,
}: SuccessStateProps) {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const shortUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/${url.shortCode}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy to clipboard failed:", error);
    }
  }, [shortUrl]);

  const toggleQRCode = useCallback(() => {
    setShowQRCode((prev) => !prev);
  }, []);

  return (
    <FadeContainer className="space-y-6">
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
              <AnimatedButton>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  <AnimatedIcon>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </AnimatedIcon>
                </Button>
              </AnimatedButton>
            </div>

            {url.title && (
              <p className="text-sm text-muted-foreground font-medium">
                {url.title}
              </p>
            )}

            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="secondary">
                {url.expiresAt ? "Expires" : "Never expires"}
              </Badge>
              <Badge variant="outline">0 clicks</Badge>
              {password && (
                <Badge variant="destructive">Password Protected</Badge>
              )}
              {clickLimit && (
                <Badge variant="outline">Max {clickLimit} clicks</Badge>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <AnimatedButton>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleQRCode}
                  className="flex items-center gap-1"
                >
                  <QrCode className="h-4 w-4" />
                  {showQRCode ? "Hide" : "Show"} QR Code
                </Button>
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQRCode && (
          <FadeContainer className="flex justify-center">
            <QRCodeComponent value={shortUrl} size={200} />
          </FadeContainer>
        )}
      </AnimatePresence>

      <AnimatedButton>
        <Button onClick={onReset} variant="outline" className="w-full">
          Create Another URL
        </Button>
      </AnimatedButton>
    </FadeContainer>
  );
});
