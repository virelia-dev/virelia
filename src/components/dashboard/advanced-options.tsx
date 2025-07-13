"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { memo, useCallback } from "react";
import { FadeContainer } from "~/components/ui/animated";

interface AdvancedOptionsProps {
  title: string;
  setTitle: (title: string) => void;
  tags: string;
  setTags: (tags: string) => void;
  password: string;
  setPassword: (password: string) => void;
  clickLimit: string;
  setClickLimit: (limit: string) => void;
  expiresAt: string;
  setExpiresAt: (date: string) => void;
  disabled?: boolean;
}

export const AdvancedOptions = memo(function AdvancedOptions({
  title,
  setTitle,
  tags,
  setTags,
  password,
  setPassword,
  clickLimit,
  setClickLimit,
  expiresAt,
  setExpiresAt,
  disabled = false,
}: AdvancedOptionsProps) {
  const setClickLimitPreset = useCallback(
    (limit: string) => {
      setClickLimit(limit);
    },
    [setClickLimit],
  );

  const setExpiryPreset = useCallback(
    (preset: string) => {
      const date = new Date();
      switch (preset) {
        case "24h":
          date.setHours(date.getHours() + 24);
          setExpiresAt(date.toISOString().slice(0, 16));
          break;
        case "1week":
          date.setDate(date.getDate() + 7);
          setExpiresAt(date.toISOString().slice(0, 16));
          break;
        case "1month":
          date.setMonth(date.getMonth() + 1);
          setExpiresAt(date.toISOString().slice(0, 16));
          break;
        case "never":
          setExpiresAt("");
          break;
      }
    },
    [setExpiresAt],
  );

  return (
    <FadeContainer className="space-y-4 p-4 border rounded-lg bg-muted/30">
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
          disabled={disabled}
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
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple tags with commas
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password Protection (optional)
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Protect your link with a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="clickLimit" className="text-sm font-medium">
          Click Limit (optional)
        </label>
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "10 clicks", value: "10" },
              { label: "100 clicks", value: "100" },
              { label: "1000 clicks", value: "1000" },
              { label: "Unlimited", value: "" },
            ].map(({ label, value }) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setClickLimitPreset(value)}
                disabled={disabled}
              >
                {label}
              </Button>
            ))}
          </div>
          <Input
            id="clickLimit"
            type="number"
            placeholder="Maximum number of clicks (leave empty for unlimited)"
            value={clickLimit}
            onChange={(e) => setClickLimit(e.target.value)}
            min="1"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Link will be automatically disabled after reaching this limit
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="expiresAt" className="text-sm font-medium">
          Expiration (optional)
        </label>
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "24h", value: "24h" },
              { label: "1 week", value: "1week" },
              { label: "1 month", value: "1month" },
              { label: "Never", value: "never" },
            ].map(({ label, value }) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpiryPreset(value)}
                disabled={disabled}
              >
                {label}
              </Button>
            ))}
          </div>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </FadeContainer>
  );
});
