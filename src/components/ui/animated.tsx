"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import {
  pageTransition,
  cardTransition,
  fadeTransition,
  buttonHover,
  buttonTap,
  iconHover,
  formFieldFocus,
  staggerContainer,
  staggerItem,
  easing,
  duration,
  createTransition,
} from "~/lib/animations";

interface AnimatedPageProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const AnimatedPage = motion.create(
  forwardRef<HTMLDivElement, AnimatedPageProps>(
    ({ children, delay = 0, ...props }, ref) => (
      <motion.div
        ref={ref}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={createTransition(duration.medium, easing.ease, delay)}
        {...props}
      >
        {children}
      </motion.div>
    ),
  ),
);

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const AnimatedCard = motion.create(
  forwardRef<HTMLDivElement, AnimatedCardProps>(
    ({ children, delay = 0, ...props }, ref) => (
      <motion.div
        ref={ref}
        variants={cardTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={createTransition(duration.medium, easing.ease, delay)}
        {...props}
      >
        {children}
      </motion.div>
    ),
  ),
);

interface AnimatedButtonProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  disabled?: boolean;
}

export const AnimatedButton = motion.create(
  forwardRef<HTMLDivElement, AnimatedButtonProps>(
    ({ children, disabled = false, ...props }, ref) => (
      <motion.div
        ref={ref}
        whileHover={disabled ? {} : buttonHover}
        whileTap={disabled ? {} : buttonTap}
        {...props}
      >
        {children}
      </motion.div>
    ),
  ),
);

interface AnimatedIconProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  disabled?: boolean;
}

export const AnimatedIcon = motion.create(
  forwardRef<HTMLDivElement, AnimatedIconProps>(
    ({ children, disabled = false, ...props }, ref) => (
      <motion.div ref={ref} whileHover={disabled ? {} : iconHover} {...props}>
        {children}
      </motion.div>
    ),
  ),
);

interface AnimatedInputProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const AnimatedInput = motion.create(
  forwardRef<HTMLDivElement, AnimatedInputProps>(
    ({ children, ...props }, ref) => (
      <motion.div ref={ref} whileFocus={formFieldFocus} {...props}>
        {children}
      </motion.div>
    ),
  ),
);

interface FadeContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const FadeContainer = motion.create(
  forwardRef<HTMLDivElement, FadeContainerProps>(
    ({ children, delay = 0, ...props }, ref) => (
      <motion.div
        ref={ref}
        variants={fadeTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={createTransition(duration.normal, easing.ease, delay)}
        {...props}
      >
        {children}
      </motion.div>
    ),
  ),
);

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
}

export const StaggerContainer = motion.create(
  forwardRef<HTMLDivElement, StaggerContainerProps>(
    (
      { children, delayChildren = 0.1, staggerChildren = 0.05, ...props },
      ref,
    ) => (
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          staggerChildren,
          delayChildren,
        }}
        {...props}
      >
        {children}
      </motion.div>
    ),
  ),
);

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const StaggerItem = motion.create(
  forwardRef<HTMLDivElement, StaggerItemProps>(
    ({ children, ...props }, ref) => (
      <motion.div ref={ref} variants={staggerItem} {...props}>
        {children}
      </motion.div>
    ),
  ),
);

interface LoadingSpinnerProps extends HTMLMotionProps<"div"> {
  size?: number;
  className?: string;
}

export const LoadingSpinner = motion.create(
  forwardRef<HTMLDivElement, LoadingSpinnerProps>(
    ({ size = 24, className = "", ...props }, ref) => (
      <motion.div
        ref={ref}
        className={`inline-block ${className}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
    ),
  ),
);

AnimatedPage.displayName = "AnimatedPage";
AnimatedCard.displayName = "AnimatedCard";
AnimatedButton.displayName = "AnimatedButton";
AnimatedIcon.displayName = "AnimatedIcon";
AnimatedInput.displayName = "AnimatedInput";
FadeContainer.displayName = "FadeContainer";
StaggerContainer.displayName = "StaggerContainer";
StaggerItem.displayName = "StaggerItem";
LoadingSpinner.displayName = "LoadingSpinner";
