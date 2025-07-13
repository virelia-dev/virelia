"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Keyboard, Command, Plus, Navigation } from "lucide-react";
import { getModifierKey } from "~/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

interface ShortcutGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

export function KeyboardShortcutsHelp({
  isOpen,
  onCloseAction,
}: KeyboardShortcutsHelpProps) {
  const modifierKey = getModifierKey();
  const cmdCtrl = modifierKey === "cmd" ? "⌘" : "Ctrl";

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "General",
      icon: Command,
      shortcuts: [
        {
          keys: [cmdCtrl, "K"],
          description: "Open command palette",
        },
        {
          keys: [cmdCtrl, "/"],
          description: "Show this help",
        },
        {
          keys: ["Esc"],
          description: "Close modals and dialogs",
        },
      ],
    },
    {
      title: "Actions",
      icon: Plus,
      shortcuts: [
        {
          keys: [cmdCtrl, "⇧", "N"],
          description: "Create new URL",
        },
      ],
    },
    {
      title: "Navigation",
      icon: Navigation,
      shortcuts: [
        {
          keys: ["G", "D"],
          description: "Go to Dashboard",
        },
        {
          keys: ["G", "A"],
          description: "Go to Analytics",
        },
        {
          keys: ["G", "M"],
          description: "Go to Manage URLs",
        },
        {
          keys: ["G", "S"],
          description: "Go to Settings",
        },
        {
          keys: ["G", "C"],
          description: "Go to Create URL",
        },
        {
          keys: ["G", "I"],
          description: "Go to Import",
        },
        {
          keys: ["G", "O"],
          description: "Go to Domains",
        },
      ],
    },
  ];

  const renderKeySequence = (keys: string[]) => (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <span key={index} className="flex items-center gap-1">
          <Badge variant="outline" className="font-mono text-xs px-2 py-1">
            {key}
          </Badge>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground text-sm">+</span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={group.title}>
              <div className="flex items-center gap-2 mb-3">
                <group.icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{group.title}</h3>
              </div>

              <div className="space-y-2">
                {group.shortcuts.map((shortcut, shortcutIndex) => (
                  <div
                    key={`${group.title}-${shortcutIndex}`}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    {renderKeySequence(shortcut.keys)}
                  </div>
                ))}
              </div>

              {groupIndex < shortcutGroups.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}

          <div className="border-t pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Press {cmdCtrl} + K to open the command palette, or {cmdCtrl} + /
              to show this help again
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
