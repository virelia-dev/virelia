"use client";

import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "motion/react";

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
      <motion.div
        className="flex flex-col min-h-screen pt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center space-y-6 max-w-2xl mx-auto px-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold tracking-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome to <span className="text-primary">Virelia</span>
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground max-w-lg mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Your modern dashboard and project management platform. Get started
              by signing in or creating an account.
            </motion.p>
            <motion.div
              className="flex items-center justify-center space-x-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          </motion.div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col min-h-screen pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          className="text-center space-y-8 max-w-4xl mx-auto px-4"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="space-y-4">
            <motion.h1
              className="text-4xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              Welcome to <span className="text-primary">Virelia</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              How hard can it be to just shorten a fucking link? <br />
              <span className="font-semibold text-foreground">Virelia</span> can
              do it without all the bullshit
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                size="lg"
                asChild
                className="text-lg px-8 py-6 border-2 hover:bg-accent transition-all duration-200"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}
