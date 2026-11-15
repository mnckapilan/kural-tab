import OpenSettingsButton from "@/components/OpenSettingsButton";

/**
 * Shown in place of the couplet when the current kural's chapter is hidden.
 * The number row's Randomise button (still on screen) moves on to a visible one.
 */
function HiddenKuralNotice() {
  return (
    <div
      className="flex flex-col items-start gap-4 text-left text-quote"
      data-testid="kural-hidden-notice"
    >
      <p>This kural is hidden by your settings</p>
      <OpenSettingsButton />
    </div>
  );
}

export default HiddenKuralNotice;
