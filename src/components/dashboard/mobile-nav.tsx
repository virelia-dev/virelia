"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import {
  Menu,
  BarChart3,
  Link,
  Settings,
  Home,
  Upload,
  Globe,
} from "lucide-react";
import { useIsMobile } from "~/hooks/use-mobile";

interface MobileNavProps {
  activeTab: string;
  onTabChangeAction: (tab: string) => void;
}

export function MobileNav({ activeTab, onTabChangeAction }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "create", label: "Create URL", icon: Link },
    { id: "import", label: "Bulk Import", icon: Upload },
    { id: "manage", label: "Manage URLs", icon: Settings },
    { id: "domains", label: "Domains", icon: Globe },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChangeAction(tabId);
    setOpen(false);
  };

  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 right-4 z-50 bg-background border shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col space-y-4 mt-8">
          <div className="px-3 py-2 text-lg font-semibold">Navigation</div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
