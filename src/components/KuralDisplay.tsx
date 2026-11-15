import React, { useMemo, useState } from "react";
import { useKural } from "../context/KuralContext";
import KuralText from "./KuralText";
import KuralMetadata from "./KuralMetadata";
import KuralExplanation from "./KuralExplanation";
import KuralMeaning from "./KuralMeaning";
import KuralSkeleton from "./KuralSkeleton";
import { useKuralLayout } from "../hooks/useKuralLayout";
import { Star } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QUOTE_CONTAINER } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { FADE_IN, FADE_OUT } from "@/lib/motion";

const KuralDisplay: React.FC = () => {
  const {
    kural,
    metadata,
    kuralData,
    favouriteKurals,
    isFavourite,
    toggleFavourite,
    selectKuralByNumber,
    isLoading,
    error,
    refreshKural,
  } = useKural();
  const { textWidth, handleLayoutChange } = useKuralLayout();
  const [showFavourites, setShowFavourites] = useState(false);
  // Bumped on each star click so the "pop" plays only on user toggles, not on navigation.
  const [starToggles, setStarToggles] = useState(0);

  const favouriteItems = useMemo(() => {
    if (!kuralData) return [];
    const map = new Map(kuralData.kural.map((item) => [item.Number, item]));
    return favouriteKurals
      .map((num) => map.get(num))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [kuralData, favouriteKurals]);

  if (isLoading) {
    return <KuralSkeleton />;
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
      ? ({ "--kural-text-width": `${textWidth}px` } as React.CSSProperties)
      : undefined;

  const starred = isFavourite(kural.Number);

  return (
    <m.div
      className={QUOTE_CONTAINER}
      style={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: FADE_IN }}
    >
      <div
        className="mb-[15px] flex items-center gap-2.5 text-left text-[28px] text-muted-foreground max-[600px]:mb-2.5 max-[600px]:text-xs"
        data-testid="kural-number"
      >
        <span data-testid="kural-number-value">{kural.Number}</span>
        <Button
          type="button"
          variant="muted"
          size="pill"
          onClick={refreshKural}
          aria-label="Randomize kural"
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
      </div>

      {/*
        Couplet swap: `wait` guarantees only one block (and one set of test ids)
        exists at a time, so the new KuralText measures itself after it mounts
        and `--kural-text-width` is only updated for the new couplet. The number
        row above updates instantly. `initial={false}` skips the first mount,
        which the card fade-in already covers.
      */}
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

      <div className="mt-5 text-left">
        <Popover open={showFavourites} onOpenChange={setShowFavourites}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="muted"
              size="md"
              disabled={favouriteItems.length === 0 && !showFavourites}
            >
              {showFavourites ? "Hide Favourites" : "See Favourites"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={12}
            className="w-[min(640px,90vw)] rounded-lg border-border p-0 shadow-none"
          >
            <div
              className="flex max-h-80 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] flex-col gap-2 overflow-y-auto p-2.5"
              data-testid="favourites-list"
            >
              {favouriteItems.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No favourites yet.
                </div>
              )}
              {favouriteItems.map((item) => (
                <div
                  key={item.Number}
                  className="flex items-stretch gap-2 rounded-md border border-border text-quote hover:border-quote hover:text-foreground"
                  data-testid="favourites-item"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto flex-1 justify-start gap-2.5 px-2.5 py-2 text-left font-light"
                    onClick={() => {
                      selectKuralByNumber(item.Number);
                      setShowFavourites(false);
                    }}
                  >
                    <span className="min-w-[26px] text-center text-xs text-muted-foreground">
                      {item.Number}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="block text-sm [overflow-wrap:normal] break-keep whitespace-nowrap">
                        {item.Line1}
                      </span>
                      <span className="block text-sm [overflow-wrap:normal] break-keep whitespace-nowrap">
                        {item.Line2}
                      </span>
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-2.5 py-2 text-xs font-light text-muted-foreground hover:text-foreground"
                    onClick={() => toggleFavourite(item.Number)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </m.div>
  );
};

export default KuralDisplay;
