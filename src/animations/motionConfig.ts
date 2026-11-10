import type { Transition, Variants } from 'framer-motion';

/** Shared easing curves and Framer Motion variants. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.76, 0, 0.24, 1];

export const fastTransition: Transition = { duration: 0.35, ease: EASE_OUT };

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

export const dialogVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE_OUT } },
  exit: { opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.25, ease: EASE_OUT } },
};

export const menuVariants: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  visible: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.6, ease: EASE_IN_OUT } },
  exit: { clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.45, ease: EASE_IN_OUT } },
};

export const menuItemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.07, duration: 0.5, ease: EASE_OUT } }),
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
