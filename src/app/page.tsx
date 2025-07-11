"use client";

import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

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
        toast.error("Failed to check authentication status");
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen pt-16">
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
    <div className="flex flex-col min-h-screen pt-16">
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome to <span className="text-primary">Virelia</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              How hard can it be to just shorten a fucking link? <br />
              <span className="font-semibold text-foreground">Virelia</span> can
              do it without all the bullshit
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="text-lg px-8 py-6 border-2 hover:bg-accent transition-all duration-200"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
