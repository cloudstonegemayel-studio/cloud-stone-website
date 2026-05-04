import type { Variants } from "framer-motion";

/** Custom easing curves — never use ease/ease-in/linear */
export const EASE = {
  expoOut:   [0.16, 1, 0.3, 1]   as const,
  expoInOut: [0.77, 0, 0.175, 1] as const,
  spring:    [0.34, 1.56, 0.64, 1] as const,
  drawer:    [0.32, 0.72, 0, 1]  as const,
} as const;

/** Fade up — primary reveal animation */
export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE.expoOut },
  },
};

/** Fade in scale — for cards and modals */
export const fadeInScale: Variants = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE.expoOut },
  },
};

/** Fade left */
export const fadeInLeft: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE.expoOut },
  },
};

/** Fade right */
export const fadeInRight: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE.expoOut },
  },
};

/** Stagger container — 60ms between children */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren:   0.1,
    },
  },
};

/** Card hover — subtle lift */
export const cardHover: Variants = {
  rest:  { y: 0,  scale: 1,    transition: { duration: 0.25, ease: EASE.expoOut } },
  hover: { y: -4, scale: 1.02, transition: { duration: 0.25, ease: EASE.expoOut } },
};

/** Hero word-by-word stagger */
export const heroWord: Variants = {
  hidden:  { opacity: 0, y: 30, skewY: 3 },
  visible: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { duration: 0.7, ease: EASE.expoOut },
  },
};

/** Clip reveal — for image sections */
export const clipReveal: Variants = {
  hidden:  { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 1, ease: EASE.expoOut },
  },
};

/** Page transition */
export const pageTransition: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE.expoOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: EASE.expoInOut },
  },
};
