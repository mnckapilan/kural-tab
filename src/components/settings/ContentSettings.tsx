import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import {
  FILE_PATHS,
  type Chapter,
  type MetadataSection,
  type Section,
} from "@/types/models";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  SettingsGroup,
  SettingsRow,
} from "@/components/settings/SettingsLayout";
import { cn } from "@/lib/utils";

type CheckState = boolean | "indeterminate";

const chaptersOf = (groups: Section["chapterGroup"]["detail"]): Chapter[] =>
  groups.flatMap((g) => [...g.chapters.detail]);

const kuralCount = (chapters: ReadonlyArray<Chapter>) =>
  chapters.reduce((n, c) => n + (c.end - c.start + 1), 0);

// PROTOTYPE: hidden chapters and display toggles are local state only.
function ContentSettings() {
  const [sections, setSections] = useState<ReadonlyArray<Section>>([]);
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());
  const [showTranslation, setShowTranslation] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);

  useEffect(() => {
    void fetch(FILE_PATHS.METADATA)
      .then((r) => r.json() as Promise<MetadataSection[]>)
      .then((data) => setSections(data[0]?.section.detail ?? []));
  }, []);

  const allChapters = useMemo(
    () => sections.flatMap((s) => chaptersOf(s.chapterGroup.detail)),
    [sections],
  );
  const visibleKurals = kuralCount(
    allChapters.filter((c) => !hidden.has(c.number)),
  );

  const stateOf = (chapters: ReadonlyArray<Chapter>): CheckState => {
    const hiddenCount = chapters.filter((c) => hidden.has(c.number)).length;
    if (hiddenCount === 0) return true;
    if (hiddenCount === chapters.length) return false;
    return "indeterminate";
  };

  const setVisible = (chapters: ReadonlyArray<Chapter>, visible: boolean) => {
    setHidden((prev) => {
      const next = new Set(prev);
      for (const c of chapters) {
        if (visible) next.delete(c.number);
        else next.add(c.number);
      }
      return next;
    });
  };

  const love = sections.find((s) => s.number === 3);
  const loveChapters = love ? chaptersOf(love.chapterGroup.detail) : [];

  return (
    <div>
      <SettingsGroup
        title="On the new tab"
        description="Choose what appears alongside each couplet."
      >
        <SettingsRow label="English translation">
          <Switch
            checked={showTranslation}
            onCheckedChange={setShowTranslation}
            aria-label="Show English translation"
          />
        </SettingsRow>
        <SettingsRow label="Tamil meaning" description="மு. வரதராசனார் உரை">
          <Switch
            checked={showMeaning}
            onCheckedChange={setShowMeaning}
            aria-label="Show Tamil meaning"
          />
        </SettingsRow>
        <SettingsRow label="Section and chapter">
          <Switch
            checked={showMetadata}
            onCheckedChange={setShowMetadata}
            aria-label="Show section and chapter"
          />
        </SettingsRow>
      </SettingsGroup>

      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mb-1 text-base font-normal text-foreground">
              Kurals to show
            </h2>
            <p className="text-sm text-muted-foreground">
              Hidden chapters are skipped when you randomise, and can&apos;t be
              opened by number.
            </p>
          </div>
          <div className="flex gap-2">
            {love && (
              <Button
                variant="muted"
                size="md"
                onClick={() => setVisible(loveChapters, false)}
              >
                Hide {love.translation} ({love.name})
              </Button>
            )}
            <Button
              variant="muted"
              size="md"
              onClick={() => setHidden(new Set())}
            >
              Show all
            </Button>
          </div>
        </div>

        <div className="mb-3 text-sm text-muted-foreground" aria-live="polite">
          Showing{" "}
          <span className="text-foreground">
            {visibleKurals.toLocaleString()}
          </span>{" "}
          of 1,330 kurals
        </div>

        <div className="divide-y divide-border/40 rounded-xl border border-border/40">
          {sections.map((section) => {
            const chapters = chaptersOf(section.chapterGroup.detail);
            return (
              <TreeNode
                key={section.number}
                level={0}
                tamil={section.name}
                english={section.translation}
                meta={`${chapters.length} chapters · ${kuralCount(chapters)} kurals`}
                state={stateOf(chapters)}
                onChange={(v) => setVisible(chapters, v)}
              >
                {section.chapterGroup.detail.map((group) => {
                  const groupChapters = group.chapters.detail;
                  return (
                    <TreeNode
                      key={group.number}
                      level={1}
                      tamil={group.name}
                      english={group.translation}
                      meta={`${groupChapters.length} ${groupChapters.length === 1 ? "chapter" : "chapters"}`}
                      state={stateOf(groupChapters)}
                      onChange={(v) => setVisible(groupChapters, v)}
                    >
                      {groupChapters.map((chapter) => (
                        <TreeNode
                          key={chapter.number}
                          level={2}
                          tamil={chapter.name}
                          english={chapter.translation}
                          meta={`${chapter.start}–${chapter.end}`}
                          state={!hidden.has(chapter.number)}
                          onChange={(v) => setVisible([chapter], v)}
                        />
                      ))}
                    </TreeNode>
                  );
                })}
              </TreeNode>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface TreeNodeProps {
  level: 0 | 1 | 2;
  tamil: string;
  english: string;
  meta: string;
  state: CheckState;
  onChange: (visible: boolean) => void;
  children?: React.ReactNode;
}

function TreeNode({
  level,
  tamil,
  english,
  meta,
  state,
  onChange,
  children,
}: TreeNodeProps) {
  const [open, setOpen] = useState(false);
  const label = `${english} (${tamil})`;

  const row = (
    <div
      className={cn(
        "flex items-center gap-3 py-3 pr-5",
        level === 0 && "pl-3",
        level === 1 && "pl-10",
        level === 2 && "pl-[4.25rem]",
      )}
    >
      {children ? (
        <CollapsiblePrimitive.Trigger
          className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          aria-label={`${open ? "Collapse" : "Expand"} ${english}`}
        >
          <ChevronRight
            className={cn("size-4 transition-transform", open && "rotate-90")}
          />
        </CollapsiblePrimitive.Trigger>
      ) : (
        <span className="size-6" />
      )}
      <Checkbox
        checked={state}
        onCheckedChange={(v) => onChange(v === true)}
        aria-label={`Show ${label}`}
      />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2",
          state === false && "opacity-50",
        )}
      >
        <span
          className={cn(
            "font-tamil text-foreground",
            level === 0 ? "text-base" : "text-sm",
          )}
        >
          {tamil}
        </span>
        <span className="text-sm text-muted-foreground">{english}</span>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {meta}
      </span>
    </div>
  );

  if (!children) return row;

  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen}>
      {row}
      <CollapsiblePrimitive.Content className="divide-y divide-border/25 border-t border-border/25">
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

export default ContentSettings;
