import type { Variants } from "motion/react";

/** Shared Motion timings: quick, ease-out, never flashy. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const FADE_IN = { duration: 0.2, ease: EASE_OUT } as const;
export const FADE_OUT = { duration: 0.12, ease: EASE_OUT } as const;

/** Slower, gentler fade for the page's first appearance. */
export const ENTRANCE = { duration: 0.6, ease: EASE_OUT } as const;

/**
 * First-load entrance: put `ENTRANCE_CONTAINER` on a parent with
 * `initial="hidden" animate="show"`, and `ENTRANCE_ITEM` on each child that
 * should fade up in sequence.
 */
export const ENTRANCE_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const ENTRANCE_ITEM: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: ENTRANCE },
};

/**
 * How long a load may take before the skeleton appears. Loads from the
 * bundled data normally finish in well under 100ms; showing a skeleton for
 * that long is just a flash.
 */
export const SKELETON_DELAY_MS = 400;
