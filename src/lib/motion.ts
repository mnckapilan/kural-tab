/** Shared Motion timings: quick, ease-out, never flashy. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const FADE_IN = { duration: 0.2, ease: EASE_OUT } as const;
export const FADE_OUT = { duration: 0.12, ease: EASE_OUT } as const;
