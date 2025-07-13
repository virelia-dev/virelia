"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Command,
  Search,
  Plus,
  BarChart3,
  Settings,
  Home,
  Globe,
  FileText,
  HelpCircle,
  Link as LinkIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { getModifierKey } from "~/hooks/use-keyboard-shortcuts";
import { Badge } from "~/components/ui/badge";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  category?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onCreateUrlAction?: () => void;
  onShowHelpAction?: () => void;
}

export function CommandPalette({
  isOpen,
  onCloseAction,
  onCreateUrlAction,
  onShowHelpAction,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const modifierKey = getModifierKey();

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "create-url",
        title: "Create new URL",
        description: "Shorten a new URL",
        icon: Plus,
        action: () => {
          onCreateUrlAction?.();
          onCloseAction();
        },
        keywords: ["new", "create", "shorten", "add"],
        category: "Actions",
      },
      {
        id: "dashboard",
        title: "Go to Dashboard",
        description: "View your dashboard overview",
        icon: Home,
        action: () => {
          router.push("/dashboard");
          onCloseAction();
        },
        keywords: ["dashboard", "home", "overview"],
        category: "Navigation",
      },
      {
        id: "analytics",
        title: "Go to Analytics",
        description: "View detailed analytics",
        icon: BarChart3,
        action: () => {
          router.push("/dashboard?tab=analytics");
          onCloseAction();
        },
        keywords: ["analytics", "stats", "clicks", "data"],
        category: "Navigation",
      },
      {
        id: "manage-urls",
        title: "Manage URLs",
        description: "View and manage your URLs",
        icon: LinkIcon,
        action: () => {
          router.push("/dashboard?tab=manage");
          onCloseAction();
        },
        keywords: ["manage", "urls", "links", "list"],
        category: "Navigation",
      },
      {
        id: "domains",
        title: "Manage Domains",
        description: "Configure custom domains",
        icon: Globe,
        action: () => {
          router.push("/dashboard?tab=domains");
          onCloseAction();
        },
        keywords: ["domains", "custom", "configure"],
        category: "Navigation",
      },
      {
        id: "settings",
        title: "Go to Settings",
        description: "Manage your account settings",
        icon: Settings,
        action: () => {
          router.push("/dashboard/settings");
          onCloseAction();
        },
        keywords: ["settings", "account", "preferences", "profile"],
        category: "Navigation",
      },
      {
        id: "bulk-import",
        title: "Bulk Import URLs",
        description: "Import multiple URLs at once",
        icon: FileText,
        action: () => {
          router.push("/dashboard?tab=import");
          onCloseAction();
        },
        keywords: ["import", "bulk", "multiple", "csv"],
        category: "Actions",
      },
      {
        id: "help",
        title: "Show Keyboard Shortcuts",
        description: "View all available shortcuts",
        icon: HelpCircle,
        action: () => {
          onShowHelpAction?.();
          onCloseAction();
        },
        keywords: ["help", "shortcuts", "hotkeys", "commands"],
        category: "Help",
      },
    ],
    [router, onCreateUrlAction, onCloseAction, onShowHelpAction],
  );

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;

    const searchLower = search.toLowerCase();
    return commands.filter(
      (command) =>
        command.title.toLowerCase().includes(searchLower) ||
        command.description?.toLowerCase().includes(searchLower) ||
        command.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchLower),
        ),
    );
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    const grouped: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((command) => {
      const category = command.category || "Other";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(command);
    });
    return grouped;
  }, [filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredCommands.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedIndex];
        if (selectedCommand) {
          selectedCommand.action();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Command Palette
            <Badge variant="outline" className="fixed top-3 right-12">
              {modifierKey === "cmd" ? "⌘" : "Ctrl"} K
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 pt-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No commands found for "{search}"
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedCommands).map(
                ([category, categoryCommands]) => (
                  <div key={category}>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {categoryCommands.map((command, categoryIndex) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <motion.button
                            key={command.id}
                            onClick={command.action}
                            className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50"
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: categoryIndex * 0.02 }}
                          >
                            <command.icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{command.title}</div>
                              {command.description && (
                                <div className="text-sm text-muted-foreground">
                                  {command.description}
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="border-t p-3 text-xs text-muted-foreground flex gap-4">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
