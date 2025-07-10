import { SignUpForm } from "~/components/auth/signup-form";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              Already a user?
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
