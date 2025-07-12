"use client";

import { SignUpForm } from "~/components/auth/signup-form";
import Link from "next/link";
import { motion } from "motion/react";

export default function SignUpPage() {
  return (
    <motion.div
      className="min-h-screen pt-16 flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/90 transition-colors duration-200"
            >
              Already a user?
            </Link>
          </p>
        </motion.div>
        <motion.div
          className="mt-8 space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SignUpForm />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
