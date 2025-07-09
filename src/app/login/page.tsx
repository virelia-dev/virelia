"use client";

import { LoginForm } from "~/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/90"
            >
              create a new account
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <LoginForm onSuccess={() => (window.location.href = "/")} />
        </div>
      </div>
    </div>
  );
}
