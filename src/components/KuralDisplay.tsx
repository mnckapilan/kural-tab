import { useState, type CSSProperties } from "react";
import { useKural } from "@/context/KuralContext";
import KuralText from "@/components/KuralText";
import KuralMetadata from "@/components/KuralMetadata";
import KuralExplanation from "@/components/KuralExplanation";
import KuralMeaning from "@/components/KuralMeaning";
import KuralSkeleton from "@/components/KuralSkeleton";
import FavouritesPopover from "@/components/FavouritesPopover";
import { useKuralLayout } from "@/hooks/useKuralLayout";
import { Star } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Button } from "@/components/ui/button";
import { QUOTE_CONTAINER } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  ENTRANCE_CONTAINER,
  ENTRANCE_ITEM,
  FADE_IN,
  FADE_OUT,
  SKELETON_DELAY_MS,
} from "@/lib/motion";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";

function KuralDisplay() {
  const {
    kural,
    metadata,
    isFavourite,
    toggleFavourite,
    isLoading,
    error,
    refreshKural,
  } = useKural();
  const { textWidth, handleLayoutChange } = useKuralLayout();
  // Bumped on each star click so the "pop" plays only on user toggles, not on navigation.
  const [starToggles, setStarToggles] = useState(0);
  const showSkeleton = useDelayedFlag(isLoading, SKELETON_DELAY_MS);

  // Fast loads render nothing (just the page background) and then fade the
  // kural in; the skeleton only appears if loading is genuinely slow.
  if (isLoading) {
    return showSkeleton ? <KuralSkeleton /> : null;
  }

  if (error || !kural) {
    return (
      <div className="flex flex-col items-center gap-3 text-quote">
        <div>Failed to load Thirukkural</div>
        {error && <div className="text-sm text-muted-foreground">{error}</div>}
        <Button
          variant="muted"
          size="md"
          className="px-4"
          onClick={refreshKural}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const containerStyle =
    textWidth > 0
      ? ({ "--kural-text-width": `${textWidth}px` } as CSSProperties)
      : undefined;

  const starred = isFavourite(kural.Number);

  return (
    <m.div
      className={QUOTE_CONTAINER}
      style={containerStyle}
      variants={ENTRANCE_CONTAINER}
      initial="hidden"
      animate="show"
    >
      <m.div
        variants={ENTRANCE_ITEM}
        className="mb-[15px] flex items-center gap-2.5 text-left text-[28px] text-muted-foreground max-[600px]:mb-2.5 max-[600px]:text-xs"
        data-testid="kural-number"
      >
        <span data-testid="kural-number-value">{kural.Number}</span>
        <Button
          type="button"
          variant="muted"
          size="pill"
          onClick={refreshKural}
        >
          Randomise
        </Button>
        <Button
          type="button"
          variant="muted"
          size="icon-round"
          className={cn(starred && "border-foreground text-foreground")}
          onClick={() => {
            toggleFavourite(kural.Number);
            setStarToggles((n) => n + 1);
          }}
          aria-pressed={starred}
          aria-label={starred ? "Remove from favourites" : "Add to favourites"}
        >
          <m.span
            key={starToggles}
            className="flex"
            initial={starred && starToggles > 0 ? { scale: 0.6 } : false}
            animate={{
              scale: 1,
              transition: { type: "spring", duration: 0.3, bounce: 0.5 },
            }}
            whileTap={{ scale: 0.85 }}
          >
            <Star
              aria-hidden="true"
              className={cn(starred && "fill-current")}
            />
          </m.span>
        </Button>
      </m.div>

      {/*
        Couplet swap: `wait` guarantees only one block (and one set of test ids)
        exists at a time, so the new KuralText measures itself after it mounts
        and `--kural-text-width` is only updated for the new couplet. The number
        row above updates instantly. `initial={false}` skips the first mount,
        which the staggered entrance already covers.
      */}
      <m.div variants={ENTRANCE_ITEM}>
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={kural.Number}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: FADE_IN }}
            exit={{ opacity: 0, y: -4, transition: FADE_OUT }}
          >
            <KuralMetadata metadata={metadata} />

            <KuralText kural={kural} onLayoutChanged={handleLayoutChange} />

            <KuralExplanation explanation={kural.Translation} />

            <KuralMeaning meaning={kural.mv} />
          </m.div>
        </AnimatePresence>
      </m.div>

      <m.div variants={ENTRANCE_ITEM} className="mt-5 text-left">
        <FavouritesPopover />
      </m.div>
    </m.div>
  );
}

export default KuralDisplay;
