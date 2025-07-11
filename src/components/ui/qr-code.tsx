"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "./button";
import { Download, Share } from "lucide-react";
import { toast } from "sonner";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  showActions?: boolean;
}

export function QRCodeComponent({
  value,
  size = 200,
  className = "",
  showActions = true,
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      setIsLoading(true);
      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
      } catch (error) {
        console.error("Error generating QR code:", error);
        toast.error("Failed to generate QR code");
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [value, size]);

  const downloadQR = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success("QR code downloaded");
  };

  const shareQR = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && typeof navigator.canShare === "function") {
          const file = new File([blob], "qr-code.png", { type: "image/png" });
          const canShareData = { files: [file] };

          if (navigator.canShare(canShareData)) {
            await navigator.share({
              files: [file],
              title: "QR Code",
              text: "Check out this QR code",
            });
            return;
          }
        }

        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("QR code copied to clipboard");
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
      toast.error("Failed to share QR code");
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`border rounded-lg ${isLoading ? "opacity-50" : ""}`}
          style={{ width: size, height: size }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {showActions && !isLoading && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQR}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareQR}
            className="flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
      )}
    </div>
  );
}
