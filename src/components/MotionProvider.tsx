import React from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/**
 * App-wide Motion setup, reusable by any entrypoint (newtab, future popup/options).
 *
 * - `LazyMotion` + `strict`: only the `m.*` components (never `motion.*`) may be
 *   used, so just the `domAnimation` feature bundle ships.
 * - `reducedMotion="user"`: transform/layout animations are disabled when the OS
 *   asks for reduced motion (opacity still fades).
 *
 * Shared timings live in `@/lib/motion`.
 */
const MotionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </LazyMotion>
);

export default MotionProvider;
