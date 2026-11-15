import { useKural } from "@/context/KuralContext";
import OpenSettingsButton from "@/components/OpenSettingsButton";
import { Button } from "@/components/ui/button";

/** Shown in place of the couplet when the current kural's chapter is hidden. */
function HiddenKuralNotice() {
  const { refreshKural } = useKural();

  return (
    <div
      className="flex flex-col items-start gap-4 text-left text-quote"
      data-testid="kural-hidden-notice"
    >
      <p>This kural is hidden by your settings</p>
      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="muted"
          size="md"
          className="px-4"
          onClick={refreshKural}
        >
          Randomise
        </Button>
        <OpenSettingsButton />
      </div>
    </div>
  );
}

export default HiddenKuralNotice;
