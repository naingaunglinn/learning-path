import type { Transition, Variants } from "motion/react";

/* Shared animation tokens. Every Motion usage in the app pulls from here
   so timing and easing stay coherent. MotionConfig reducedMotion="user"
   (set in components/providers.tsx) disables transform/layout animation
   globally when the OS asks for reduced motion; anything hand-rolled
   (count-ups, progress sweeps) must additionally check useReducedMotion. */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const; // fast start, long settle

export const DUR = {
  micro: 0.2, // hovers, presses, toggles
  enter: 0.4, // card / list / chart entrances
} as const;

export const STAGGER = 0.04;

export const enterTransition: Transition = { duration: DUR.enter, ease: EASE_OUT };
export const microTransition: Transition = { duration: DUR.micro, ease: EASE_OUT };

/** Parent wrapper that staggers its children on mount. */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER } },
};

/** Standard entrance: fade + 8px rise. Pair with staggerParent. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: enterTransition },
};

/** Entrance for rows that can also leave (use inside AnimatePresence). */
export const rowInOut: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: enterTransition },
  exit: { opacity: 0, y: -4, transition: microTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: enterTransition },
};
