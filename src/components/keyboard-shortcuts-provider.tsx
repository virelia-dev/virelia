"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "~/components/command-palette";
import { KeyboardShortcutsHelp } from "~/components/keyboard-shortcuts-help";
import {
  useKeyboardShortcuts,
  useSequentialKeys,
  getModifierKey,
} from "~/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const router = useRouter();
  const modifierKey = getModifierKey();

  const handleCreateUrl = useCallback(() => {
    router.push("/dashboard?tab=create");
  }, [router]);

  const handleCloseCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const handleOpenCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const handleOpenHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const handleCloseHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  useKeyboardShortcuts([
    {
      key: "k",
      ...(modifierKey === "cmd" ? { metaKey: true } : { ctrlKey: true }),
      callback: handleOpenCommandPalette,
      description: "Open command palette",
    },
    {
      key: "n",
      ...(modifierKey === "cmd" ? { metaKey: true } : { ctrlKey: true }),
      shiftKey: true,
      callback: handleCreateUrl,
      description: "Create new URL",
    },
    {
      key: "/",
      ...(modifierKey === "cmd" ? { metaKey: true } : { ctrlKey: true }),
      callback: handleOpenHelp,
      description: "Show keyboard shortcuts help",
    },
    {
      key: "Escape",
      callback: () => {
        setIsCommandPaletteOpen(false);
        setIsHelpOpen(false);
      },
      description: "Close modals and dialogs",
    },
  ]);

  useSequentialKeys({
    gd: () => router.push("/dashboard"),
    ga: () => router.push("/dashboard?tab=analytics"),
    gm: () => router.push("/dashboard?tab=manage"),
    gs: () => router.push("/dashboard/settings"),
    gc: () => router.push("/dashboard?tab=create"),
    gi: () => router.push("/dashboard?tab=import"),
    go: () => router.push("/dashboard?tab=domains"),
  });

  return (
    <>
      {children}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onCloseAction={handleCloseCommandPalette}
        onCreateUrlAction={handleCreateUrl}
        onShowHelpAction={handleOpenHelp}
      />
      <KeyboardShortcutsHelp
        isOpen={isHelpOpen}
        onCloseAction={handleCloseHelp}
      />
    </>
  );
}
