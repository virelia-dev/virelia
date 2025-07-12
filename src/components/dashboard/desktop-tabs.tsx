"use client";

import { Button } from "~/components/ui/button";
import { BarChart3, Link, Settings, Home, Upload, Globe } from "lucide-react";
import { useIsMobile } from "~/hooks/use-mobile";

interface DesktopTabsProps {
  activeTab: string;
  onTabChangeAction: (tab: string) => void;
}

export function DesktopTabs({
  activeTab,
  onTabChangeAction,
}: DesktopTabsProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "create", label: "Create URL", icon: Link },
    { id: "import", label: "Bulk Import", icon: Upload },
    { id: "manage", label: "Manage URLs", icon: Settings },
    { id: "domains", label: "Domains", icon: Globe },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="hidden md:flex border-b">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChangeAction(tab.id)}
              className={`flex items-center gap-2 border-b-2 rounded-none px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
