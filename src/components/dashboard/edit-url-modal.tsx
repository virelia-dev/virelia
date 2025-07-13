"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { motion } from "motion/react";
import { cardTransition, fadeTransition } from "~/lib/animations";

interface EditUrlModalProps {
  url: any;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export const EditUrlModal = memo(function EditUrlModal({
  url,
  onSubmit,
  onClose,
}: EditUrlModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;

      setIsSubmitting(true);
      try {
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const tags = formData.get("tags") as string;
        const expiresAt = formData.get("expiresAt") as string;

        await onSubmit({
          title: title || null,
          description: description || null,
          tags: tags || null,
          expiresAt: expiresAt || null,
        });
      } catch (error) {
        console.error("Edit submit error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, isSubmitting],
  );

  const setExpiryPreset = useCallback((preset: string) => {
    const input = document.querySelector(
      'input[name="expiresAt"]',
    ) as HTMLInputElement;
    if (!input) return;

    const date = new Date();
    switch (preset) {
      case "24h":
        date.setHours(date.getHours() + 24);
        break;
      case "1week":
        date.setDate(date.getDate() + 7);
        break;
      case "1month":
        date.setMonth(date.getMonth() + 1);
        break;
      case "never":
        input.value = "";
        return;
    }
    input.value = date.toISOString().slice(0, 16);
  }, []);

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
        className="bg-background border rounded-lg p-6 max-w-md w-full"
        variants={cardTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit URL</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Short Code</label>
            <Input value={url.shortCode} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Short codes cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Original URL</label>
            <Input value={url.originalUrl} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Original URL cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title (Optional)</label>
            <Input
              name="title"
              defaultValue={url.title || ""}
              placeholder="Descriptive title for your link"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description (Optional)
            </label>
            <Input
              name="description"
              defaultValue={url.description || ""}
              placeholder="Brief description of the link"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (Optional)</label>
            <Input
              name="tags"
              defaultValue={url.tags || ""}
              placeholder="work, marketing, social (comma-separated)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expires At (Optional)</label>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiryPreset("24h")}
                  disabled={isSubmitting}
                >
                  24h
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiryPreset("1week")}
                  disabled={isSubmitting}
                >
                  1 week
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiryPreset("1month")}
                  disabled={isSubmitting}
                >
                  1 month
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiryPreset("never")}
                  disabled={isSubmitting}
                >
                  Never
                </Button>
              </div>
              <Input
                name="expiresAt"
                type="datetime-local"
                defaultValue={
                  url.expiresAt
                    ? new Date(url.expiresAt).toISOString().slice(0, 16)
                    : ""
                }
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank for no expiration
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
});
