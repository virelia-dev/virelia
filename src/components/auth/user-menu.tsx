"use client";

import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { User } from "better-auth/types";
import { Button } from "~/components/ui/button";
import { UserAvatar } from "~/components/ui/user-avatar";
import { toast } from "sonner";

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError("Failed to sign out. Please try again.");
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
      setError("Failed to sign out. Please try again.");
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <UserAvatar user={user} className="h-8 w-8" />
        <div className="hidden md:block">
          <span className="text-sm text-foreground">
            {user.name || user.email}
          </span>
        </div>
      </div>
      <div className="relative">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? "Signing out..." : "Sign Out"}
        </Button>
        {error && (
          <div className="absolute top-full left-0 mt-1 bg-destructive/10 border border-destructive/20 rounded px-2 py-1 text-xs text-destructive whitespace-nowrap z-10">
            {" "}
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
