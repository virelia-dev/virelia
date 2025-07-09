"use client";

import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Welcome to <span className="text-primary">Virelia</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Your modern dashboard and project management platform. Get started
              by signing in or creating an account.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">Virelia</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Your modern dashboard and project management platform. Get started
            by signing in or creating an account.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
