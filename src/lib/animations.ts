// Sentinel V2 — Core animation variants for Framer Motion
import type { Variants } from 'framer-motion';

const cubicEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Entrance animation variants
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay, ease: cubicEase }
  })
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, delay, ease: 'easeOut' as const }
  })
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.4, delay, ease: cubicEase }
  })
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (delay: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, delay, ease: cubicEase }
  })
};

// Stagger container
export const staggerContainer = (staggerDelay: number = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: staggerDelay } }
});

// Number counter animation config
export const counterAnimation = {
  duration: 1000,
  ease: cubicEase
};

// Bar grow (for progress bars and chart bars)
export const barGrow: Variants = {
  hidden: { scaleX: 0 },
  visible: (delay: number = 0) => ({
    scaleX: 1,
    transition: { duration: 0.8, delay, ease: cubicEase }
  })
};

// Hover variants
export const cardHover: Variants = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: { duration: 0.2 }
  }
};

export const rowHover: Variants = {
  rest: { x: 0 },
  hover: {
    x: 2,
    transition: { duration: 0.15 }
  }
};
