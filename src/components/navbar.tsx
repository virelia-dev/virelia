"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { User } from "better-auth/types";
import { UserAvatar } from "~/components/ui/user-avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth-session" || e.key === null) {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-foreground">
                Virelia
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <UserAvatar user={user} className="h-8 w-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            <Link
              href="/"
              className="text-foreground/80 hover:text-foreground hover:bg-accent block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-foreground/80 hover:text-foreground hover:bg-accent block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-foreground/80 hover:text-foreground hover:bg-accent block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="text-foreground/80 hover:text-foreground hover:bg-accent block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Contact
            </Link>

            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : user ? (
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3 mb-3">
                  <UserAvatar user={user} className="h-8 w-8" />
                  <div>
                    <p className="text-sm font-medium">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/dashboard/profile">Profile</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/dashboard/settings">Settings</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
