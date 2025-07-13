"use client";

import { Button } from "~/components/ui/button";
import { QRCodeComponent } from "~/components/ui/qr-code";
import { X } from "lucide-react";
import { memo } from "react";
import { motion } from "motion/react";
import {
  cardTransition,
  fadeTransition,
  scaleTransition,
} from "~/lib/animations";

interface QRCodeModalProps {
  url: string;
  onClose: () => void;
}

export const QRCodeModal = memo(function QRCodeModal({
  url,
  onClose,
}: QRCodeModalProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      variants={fadeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="bg-background border rounded-lg p-6 max-w-sm w-full"
        variants={cardTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">QR Code</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <motion.div
          className="flex justify-center"
          variants={scaleTransition}
          initial="initial"
          animate="animate"
        >
          <QRCodeComponent value={url} size={200} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
});
