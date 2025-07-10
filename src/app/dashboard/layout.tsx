import Link from "next/link";
import { BarChart3, Settings, Home } from "lucide-react";
import { Toaster } from "~/components/ui/sonner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const Sidebar = ({ className }: { className?: string }) => (
    <div className={`flex h-full flex-col border-t border-border ${className}`}>
      <nav className="flex-1 space-y-1 p-4 px-2">
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
    <div className="flex h-screen pt-16 overflow-hidden">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:top-16 md:bottom-0 md:z-40 md:bg-background">
        <div className="flex flex-col h-full border-r border-border bg-background">
          <Sidebar />
        </div>
      </div>

      <div className="flex flex-col flex-1 md:ml-64 h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto overscroll-none p-4 md:p-6">
          <div className="max-w-full">{children}</div>
          <Toaster />
        </main>
      </div>
    </div>
  );
}
