import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-extrabold text-muted-foreground/20 select-none">
              404
            </h1>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Page Not Found
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                The page you're looking for doesn't exist or may have been
                moved.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Go Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link
                href="javascript:history.back()"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </Link>
            </Button>
          </div>

          <div className="pt-8 border-t border-border/50">
            <p className="text-muted-foreground mb-6 font-medium">
              Popular pages:
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
              >
                <Search className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
              >
                <Search className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
              >
                <Search className="h-4 w-4" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
