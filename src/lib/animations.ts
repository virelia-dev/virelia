import type { Variants, Transition } from "motion/react";

export const easing = {
  ease: [0.16, 1, 0.3, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 400, damping: 17 },
  springGentle: { type: "spring", stiffness: 300, damping: 20 },
} as const;

export const duration = {
  fast: 0.2,
  normal: 0.3,
  medium: 0.4,
  slow: 0.5,
  slower: 0.6,
} as const;

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const cardTransition: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

export const slideTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleTransition: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const listItemTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const buttonHover = {
  scale: 1.02,
  transition: easing.spring,
};

export const buttonTap = {
  scale: 0.98,
  transition: easing.spring,
};

export const iconHover = {
  scale: 1.1,
  rotate: 5,
  transition: easing.spring,
};

export const spinnerAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear",
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const formFieldFocus = {
  scale: 1.01,
  transition: easing.springGentle,
};

export const errorShake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.4 },
  },
};

export const successPulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.6 },
  },
};

export function createTransition(
  duration = 0.3,
  ease = easing.ease,
  delay = 0,
): Transition {
  return {
    duration,
    ease,
    delay,
  };
}

export function createStagger(
  delayChildren = 0.1,
  staggerChildren = 0.05,
): Transition {
  return {
    staggerChildren,
    delayChildren,
  };
}
