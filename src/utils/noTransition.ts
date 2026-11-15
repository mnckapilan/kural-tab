/**
 * Runs `apply` (which changes theme/palette attributes on <html>) with the
 * body's colour transitions disabled, so a storage correction of the
 * first-paint hint doesn't animate. User-initiated changes skip this and
 * animate normally. The `no-transition` class is defined in globals.css.
 */
export function withoutTransitions(apply: () => void): void {
  const { body } = document;
  body.classList.add("no-transition");
  apply();
  // Flush styles while transitions are off, so removing the class below
  // doesn't start one.
  void body.offsetWidth;
  body.classList.remove("no-transition");
}
