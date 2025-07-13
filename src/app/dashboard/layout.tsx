"use client";

import Link from "next/link";
import { BarChart3, Settings, Home } from "lucide-react";
import { Toaster } from "~/components/ui/sonner";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import ErrorBoundary from "~/components/error-boundary";

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
  const pathname = usePathname();

  const Sidebar = ({ className }: { className?: string }) => (
    <motion.div
      className={`flex h-full flex-col border-t border-border ${className}`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="flex-1 space-y-1 p-4 px-2">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </nav>
    </motion.div>
  );

  return (
    <motion.div
      suppressHydrationWarning
      className="flex h-screen pt-16 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:top-16 md:bottom-0 md:z-40 md:bg-background">
        <div className="flex flex-col h-full border-r border-border bg-background">
          <Sidebar />
        </div>
      </div>

      <div className="flex flex-col flex-1 md:ml-64 h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto overscroll-none p-4 md:p-6">
          <motion.div
            className="max-w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            key={pathname}
          >
            <ErrorBoundary>{children}</ErrorBoundary>
          </motion.div>
          <Toaster />
        </main>
      </div>
    </motion.div>
  );
}
