"use client";

import { useEffect, useCallback, useRef } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {},
) {
  const { enabled = true } = options;
  const shortcutsRef = useRef(shortcuts);

  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const matchingShortcut = shortcutsRef.current.find((shortcut) => {
        const keyMatches =
          shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const metaMatches = !!shortcut.metaKey === event.metaKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
        const altMatches = !!shortcut.altKey === event.altKey;

        return (
          keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches
        );
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }
        matchingShortcut.callback();
      }
    },
    [enabled],
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [handleKeyDown]);
}

export function useSequentialKeys(
  sequences: Record<string, () => void>,
  options: { timeout?: number; enabled?: boolean } = {},
) {
  const { timeout = 1000, enabled = true } = options;
  const sequenceRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        sequenceRef.current += event.key.toLowerCase();

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const matchingSequence = Object.keys(sequences).find((seq) =>
          seq.startsWith(sequenceRef.current),
        );

        if (matchingSequence) {
          if (matchingSequence === sequenceRef.current) {
            event.preventDefault();
            event.stopPropagation();
            sequences[matchingSequence]();
            sequenceRef.current = "";
          } else {
            timeoutRef.current = setTimeout(() => {
              sequenceRef.current = "";
            }, timeout);
          }
        } else {
          sequenceRef.current = "";
        }
      }
    },
    [enabled, sequences, timeout],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyDown]);
}

export function getModifierKey(): "cmd" | "ctrl" {
  return typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    ? "cmd"
    : "ctrl";
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.metaKey) parts.push("⌘");
  if (shortcut.ctrlKey) parts.push("Ctrl");
  if (shortcut.shiftKey) parts.push("⇧");
  if (shortcut.altKey) parts.push("⌥");

  parts.push(shortcut.key.toUpperCase());

  return parts.join(" + ");
}
