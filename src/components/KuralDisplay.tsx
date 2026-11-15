import { useState } from "react";
import { useKural } from "@/context/KuralContext";
import KuralText from "@/components/KuralText";
import KuralMetadata from "@/components/KuralMetadata";
import KuralExplanation from "@/components/KuralExplanation";
import KuralMeaning from "@/components/KuralMeaning";
import KuralSkeleton from "@/components/KuralSkeleton";
import FavouritesPopover from "@/components/FavouritesPopover";
import KuralNumberJump from "@/components/KuralNumberJump";
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

  const starred = isFavourite(kural.Number);

  return (
    <m.div
      className={QUOTE_CONTAINER}
      variants={ENTRANCE_CONTAINER}
      initial="hidden"
      animate="show"
    >
      <m.div
        variants={ENTRANCE_ITEM}
        className="mb-2.5 flex items-center gap-2.5 text-left text-kural-number-sm text-muted-foreground sm:mb-4 sm:text-kural-number"
        data-testid="kural-number"
      >
        <KuralNumberJump kuralNumber={kural.Number} />
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
        exists at a time. The number row above updates instantly.
        `initial={false}` skips the first mount, which the staggered entrance
        already covers.

        `w-min` sizes this block to its min-content width. The couplet lines are
        `whitespace-nowrap`, so that is the longer line, and the translation and
        meaning (which can wrap) fill exactly that width. Pure CSS, so there is
        no measurement to go stale when the font loads or the window resizes.
      */}
      <m.div variants={ENTRANCE_ITEM}>
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={kural.Number}
            className="w-min"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: FADE_IN }}
            exit={{ opacity: 0, y: -4, transition: FADE_OUT }}
          >
            <KuralMetadata metadata={metadata} />

            <KuralText kural={kural} />

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
