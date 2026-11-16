import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";
import {
  Collapsible as CollapsiblePrimitive,
  RadioGroup as RadioGroupPrimitive,
} from "radix-ui";
import { useContent } from "@/context/ContentContext";
import { KuralService } from "@/services/kuralService";
import type {
  Chapter,
  MeaningSourceId,
  Section,
  TranslationSourceId,
} from "@/types/models";
import {
  MEANING_SOURCES,
  TRANSLATION_SOURCES,
  meaningSourceOf,
} from "@/lib/contentOptions";
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

const LOVE_SECTION_NUMBER = 3;

function ContentSettings() {
  const {
    content,
    setShowTranslation,
    setShowMeaning,
    setShowMetadata,
    setTranslationSource,
    setMeaningSource,
    setHiddenChapters,
  } = useContent();
  const [sections, setSections] = useState<ReadonlyArray<Section>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    KuralService.fetchSections().then(
      (data) => {
        if (!cancelled) setSections(data);
      },
      (error: unknown) => {
        if (cancelled) return;
        console.error("Error loading chapters:", error);
        setLoadError(
          error instanceof Error ? error.message : "Failed to load chapters",
        );
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const hidden = useMemo(
    () => new Set(content.hiddenChapters),
    [content.hiddenChapters],
  );
  const allChapters = useMemo(
    () => sections.flatMap((s) => chaptersOf(s.chapterGroup.detail)),
    [sections],
  );
  const totalKurals = kuralCount(allChapters);
  const visibleKurals = kuralCount(
    allChapters.filter((c) => !hidden.has(c.number)),
  );

  const stateOf = (chapters: ReadonlyArray<Chapter>): CheckState => {
    const hiddenCount = chapters.filter((c) => hidden.has(c.number)).length;
    if (hiddenCount === 0) return true;
    if (hiddenCount === chapters.length) return false;
    return "indeterminate";
  };

  // Applies a change unless it would leave nothing to show.
  const setVisible = (chapters: ReadonlyArray<Chapter>, visible: boolean) => {
    const next = new Set(hidden);
    for (const c of chapters) {
      if (visible) next.delete(c.number);
      else next.add(c.number);
    }
    if (allChapters.every((c) => next.has(c.number))) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    setHiddenChapters([...next]);
  };

  const love = sections.find((s) => s.number === LOVE_SECTION_NUMBER);
  const loveChapters = love ? chaptersOf(love.chapterGroup.detail) : [];
  const loveHidden = love !== undefined && stateOf(loveChapters) === false;

  return (
    <div>
      <SettingsGroup
        title="On the new tab"
        description="Choose what appears alongside each couplet."
      >
        <SettingsRow
          label="English translation"
          description={
            TRANSLATION_SOURCES.find((t) => t.id === content.translationSource)
              ?.name
          }
        >
          <Switch
            checked={content.showTranslation}
            onCheckedChange={setShowTranslation}
            aria-label="Show English translation"
          />
        </SettingsRow>
        <SettingsRow
          label="Tamil meaning"
          description={`${meaningSourceOf(content.meaningSource).tamil} உரை · ${meaningSourceOf(content.meaningSource).english}`}
        >
          <Switch
            checked={content.showMeaning}
            onCheckedChange={setShowMeaning}
            aria-label="Show Tamil meaning"
          />
        </SettingsRow>
        <SettingsRow label="Section and chapter">
          <Switch
            checked={content.showMetadata}
            onCheckedChange={setShowMetadata}
            aria-label="Show section and chapter"
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup
        title="Tamil meaning"
        description={
          content.showMeaning
            ? "Whose உரை (commentary) to show. Each is shown with its author's name."
            : "Turn on Tamil meaning above to choose a commentary."
        }
      >
        <RadioGroupPrimitive.Root
          value={content.meaningSource}
          onValueChange={(value) => setMeaningSource(value as MeaningSourceId)}
          disabled={!content.showMeaning}
          aria-label="Tamil meaning commentary"
          className="grid grid-cols-1 gap-px"
        >
          {MEANING_SOURCES.map((m) => (
            <SourceOption
              key={m.id}
              value={m.id}
              label={`${m.english} (${m.tamil})`}
            >
              <div className="text-sm text-foreground">
                <span className="font-tamil">{m.tamil}</span>
                <span className="text-muted-foreground"> · {m.english}</span>
              </div>
              <div className="mt-1 font-tamil text-xs text-muted-foreground">
                {m.sample}
              </div>
            </SourceOption>
          ))}
        </RadioGroupPrimitive.Root>
      </SettingsGroup>

      <SettingsGroup
        title="English translation"
        description={
          content.showTranslation
            ? "How the couplet is put into English."
            : "Turn on English translation above to choose a style."
        }
      >
        <RadioGroupPrimitive.Root
          value={content.translationSource}
          onValueChange={(value) =>
            setTranslationSource(value as TranslationSourceId)
          }
          disabled={!content.showTranslation}
          aria-label="English translation style"
          className="grid grid-cols-1 gap-px"
        >
          {TRANSLATION_SOURCES.map((t) => (
            <SourceOption key={t.id} value={t.id} label={t.name}>
              <div className="text-sm text-foreground">
                {t.name}
                <span className="text-muted-foreground"> · {t.credit}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {t.description}
              </div>
              <div className="mt-1 text-xs text-muted-foreground italic">
                {t.sample}
              </div>
            </SourceOption>
          ))}
        </RadioGroupPrimitive.Root>
      </SettingsGroup>

      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mb-1 text-base font-normal text-foreground">
              Kurals to show
            </h2>
            <p className="text-sm text-muted-foreground">
              Hidden chapters are skipped when you randomise. Opening one by
              number shows a notice instead.
            </p>
          </div>
          <div className="flex gap-2">
            {love && (
              <Button
                variant="muted"
                size="md"
                disabled={loveHidden}
                onClick={() => setVisible(loveChapters, false)}
              >
                Hide {love.translation} ({love.name})
              </Button>
            )}
            <Button
              variant="muted"
              size="md"
              disabled={hidden.size === 0}
              onClick={() => {
                setBlocked(false);
                setHiddenChapters([]);
              }}
            >
              Show all
            </Button>
          </div>
        </div>

        <div role="status" className="mb-3 text-sm text-muted-foreground">
          {sections.length > 0 && (
            <>
              Showing{" "}
              <span className="text-foreground">
                {visibleKurals.toLocaleString()}
              </span>{" "}
              of {totalKurals.toLocaleString()} kurals
            </>
          )}
          {blocked && (
            <div className="mt-1 text-destructive">
              At least one chapter must stay visible
            </div>
          )}
        </div>

        {loadError ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-border/40 p-5 text-sm text-muted-foreground">
            <div>Couldn&apos;t load the chapter list. {loadError}</div>
            <Button
              variant="muted"
              size="md"
              onClick={() => {
                setLoadError(null);
                setAttempt((n) => n + 1);
              }}
            >
              Try Again
            </Button>
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-xl border border-border/40 p-5 text-sm text-muted-foreground">
            Loading chapters…
          </div>
        ) : (
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
        )}
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

function SourceOption({
  value,
  label,
  children,
}: {
  value: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      aria-label={label}
      className="group flex items-start justify-between gap-3 px-5 py-4 text-left outline-none hover:bg-accent/60 focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-accent"
    >
      <div>{children}</div>
      <Check className="mt-1 size-4 shrink-0 text-foreground opacity-0 group-data-[state=checked]:opacity-100" />
    </RadioGroupPrimitive.Item>
  );
}

export default ContentSettings;
