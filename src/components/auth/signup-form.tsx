"use client";

import { useState, useMemo } from "react";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

function parseAuthError(error: any): string {
  if (typeof error === "string") return error;

  if (error?.message) {
    const message = error.message.toLowerCase();

    if (message.includes("password is too short")) {
      return "Password must be at least 8 characters long.";
    }
    if (message.includes("password is too weak")) {
      return "Password is too weak. Please use a mix of letters, numbers, and symbols.";
    }
    if (
      message.includes("email already exists") ||
      message.includes("already registered")
    ) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (message.includes("invalid email")) {
      return "Please enter a valid email address.";
    }
    if (
      message.includes("name is required") ||
      message.includes("missing name")
    ) {
      return "Name is required.";
    }
    if (message.includes("rate limit") || message.includes("too many")) {
      return "Too many signup attempts. Please wait a few minutes and try again.";
    }

    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

function validatePassword(password: string) {
  const issues = [];

  if (password.length < 8) {
    issues.push("Must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    issues.push("Must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    issues.push("Must contain at least one lowercase letter");
  }
  if (!/\d/.test(password)) {
    issues.push("Must contain at least one number");
  }

  return {
    isValid: issues.length === 0,
    issues,
    strength: password.length === 0 ? 0 : Math.max(1, 4 - issues.length),
  };
}

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

  const passwordValidation = useMemo(
    () => validatePassword(password),
    [password],
  );

  const handleGitHubSignUp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });

      if (result.error) {
        const errorMessage = parseAuthError(result.error);
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        toast.success("Signed up with GitHub successfully!");
      }
    } catch (err) {
      console.error("GitHub sign up error:", err);
      toast.error(
        "Failed to sign up with GitHub. Please try again or contact support.",
      );
      setError(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      toast.error("Name is required");
      setIsLoading(false);
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      toast.error("Email is required");
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      toast.error("Password is required");
      setIsLoading(false);
      return;
    }
    if (!passwordValidation.isValid) {
      const errorMessage = `Password requirements not met: ${passwordValidation.issues.join(", ")}`;
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      if (result.error) {
        const errorMessage = parseAuthError(result.error);
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      toast.success("Account created successfully! Welcome!");
      window.location.href = "/";
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGitHubSignUp}
          disabled={isLoading}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clipRule="evenodd"
            />
          </svg>
          Continue with GitHub
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground "
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Your display name"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground "
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground "
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowPasswordHelp(true)}
            onBlur={() => setShowPasswordHelp(false)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Create a strong password"
          />

          {password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordValidation.strength)}`}
                    style={{
                      width: `${(passwordValidation.strength / 4) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {getStrengthText(passwordValidation.strength)}
                </span>
              </div>
            </div>
          )}

          {(showPasswordHelp || !passwordValidation.isValid) && password && (
            <div className="mt-2 text-xs space-y-1">
              {passwordValidation.issues.map((issue, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-1 text-red-600"
                >
                  <span>•</span>
                  <span>{issue}</span>
                </div>
              ))}
              {passwordValidation.isValid && (
                <div className="flex items-center space-x-1 text-green-600">
                  <span>✓</span>
                  <span>Password meets all requirements</span>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Sign up failed
                </h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !passwordValidation.isValid}
          className="w-full"
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}
