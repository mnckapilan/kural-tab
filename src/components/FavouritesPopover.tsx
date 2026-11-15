import { useMemo, useState } from "react";
import { useKural } from "@/context/KuralContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** "See Favourites" toggle plus the popover listing the starred kurals. */
function FavouritesPopover() {
  const {
    kuralData,
    favouriteKurals,
    toggleFavourite,
    selectKuralByNumber,
    isKuralHidden,
  } = useKural();
  const [open, setOpen] = useState(false);

  const favouriteItems = useMemo(() => {
    if (!kuralData) return [];
    const map = new Map(kuralData.kural.map((item) => [item.Number, item]));
    return favouriteKurals
      .map((num) => map.get(num))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [kuralData, favouriteKurals]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="muted"
          size="md"
          disabled={favouriteItems.length === 0 && !open}
        >
          {open ? "Hide Favourites" : "See Favourites"}
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
          {favouriteItems.map((item) => {
            const hidden = isKuralHidden(item.Number);
            return (
              <div
                key={item.Number}
                className={cn(
                  "flex items-stretch gap-2 rounded-md border border-border text-quote hover:border-quote hover:text-foreground",
                  hidden && "opacity-60",
                )}
                data-testid="favourites-item"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto flex-1 justify-start gap-2.5 px-2.5 py-2 text-left font-light"
                  onClick={() => {
                    selectKuralByNumber(item.Number);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-7 text-center text-xs text-muted-foreground">
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
                  {hidden && (
                    <span className="ml-auto self-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      Hidden
                    </span>
                  )}
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
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default FavouritesPopover;
