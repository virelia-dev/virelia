"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import Link from "next/link";
import { Menu, BarChart3, FolderOpen, Settings, Home } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const Sidebar = ({ className }: { className?: string }) => (
    <div className={`flex h-full flex-col ${className}`}>
      <div className="flex items-center border-b px-6 py-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Virelia</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-border bg-background">
          <Sidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Top Navigation */}
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-6">
          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Empty space to center or add additional header content */}
          <div></div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
