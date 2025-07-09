"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { User } from "better-auth/types";

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const getAvatarUrl = () => {
    // Use OAuth provider image if available
    if (user.image) {
      return user.image;
    }

    // Fallback to Vercel avatar service using email or name
    const identifier = user.email || user.name || "anonymous";
    return `https://avatar.vercel.sh/${encodeURIComponent(identifier)}`;
  };

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }

    return "U";
  };

  return (
    <Avatar className={className}>
      <AvatarImage
        src={getAvatarUrl()}
        alt={user.name || user.email || "User"}
      />
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
}
