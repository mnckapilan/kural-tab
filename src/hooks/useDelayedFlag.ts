import { useEffect, useState } from "react";

/**
 * Returns true only once `flag` has stayed true for `delayMs`. Resets as soon
 * as `flag` turns false. Used to avoid flashing loading UI for fast loads.
 */
export const useDelayedFlag = (flag: boolean, delayMs: number): boolean => {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!flag) {
      setDelayed(false);
      return;
    }
    const timer = setTimeout(() => setDelayed(true), delayMs);
    return () => clearTimeout(timer);
  }, [flag, delayMs]);

  return flag && delayed;
};
