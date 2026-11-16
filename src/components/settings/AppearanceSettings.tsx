import { useState } from "react";
import { Check, Monitor, Moon, Plus, Sun } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useAppearance } from "@/context/AppearanceContext";
import { useTheme } from "@/context/ThemeContext";
import {
  PALETTE,
  THEME,
  type FontSizeId,
  type PaletteId,
  type ResolvedTheme,
  type TamilFontId,
  type ThemeType,
} from "@/types/models";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  SettingsGroup,
  SettingsRow,
} from "@/components/settings/SettingsLayout";
import { FONT_SIZES, PALETTES, TAMIL_FONTS } from "@/lib/appearanceOptions";
import { normaliseHex, pickForeground } from "@/lib/colour";
import { cn } from "@/lib/utils";

const SAMPLE = {
  number: 1,
  line1: "அகர முதல எழுத்தெல்லாம் ஆதி",
  line2: "பகவன் முதற்றே உலகு.",
  translation:
    "'A' leads letters; the Ancient Lord Leads and lords the entire world",
};

// The preview is plain app markup (font-tamil, text-quote, the scaled text
// sizes): the settings are applied to <html>, so it reflects them live.
function AppearanceSettings() {
  const { theme, themePreference, setThemePreference } = useTheme();
  const {
    appearance,
    setFontSize,
    setTamilFont,
    setPalette,
    setCustomBackground,
    resetAppearance,
  } = useAppearance();

  const customBackground = appearance.customBackground[theme];

  const reset = () => {
    resetAppearance();
    setThemePreference(THEME.DARK);
  };

  return (
    <div>
      {/* Live preview */}
      <div
        className="mb-10 overflow-x-auto rounded-xl border border-border/40 px-8 py-8 text-quote"
        data-testid="appearance-preview"
      >
        <div className="mb-4 text-xs tracking-widest text-muted-foreground uppercase">
          Preview · Kural {SAMPLE.number}
        </div>
        <div className="mb-4 font-tamil text-kural-sm sm:text-kural">
          <div className="whitespace-nowrap">{SAMPLE.line1}</div>
          <div className="whitespace-nowrap">{SAMPLE.line2}</div>
        </div>
        <div className="text-body sm:text-body-lg">{SAMPLE.translation}</div>
      </div>

      <SettingsGroup title="Theme">
        <SettingsRow
          label="Colour mode"
          description="System follows your device's light or dark setting."
        >
          <ToggleGroup
            type="single"
            value={themePreference}
            onValueChange={(value) => {
              if (value) setThemePreference(value as ThemeType);
            }}
            aria-label="Colour mode"
          >
            <ToggleGroupItem value={THEME.LIGHT} aria-label="Light">
              <Sun /> Light
            </ToggleGroupItem>
            <ToggleGroupItem value={THEME.DARK} aria-label="Dark">
              <Moon /> Dark
            </ToggleGroupItem>
            <ToggleGroupItem value={THEME.SYSTEM} aria-label="System">
              <Monitor /> System
            </ToggleGroupItem>
          </ToggleGroup>
        </SettingsRow>
        <div className="px-5 py-4">
          <div className="mb-3 text-sm text-foreground">Background</div>
          <RadioGroupPrimitive.Root
            value={appearance.palette}
            onValueChange={(value) => setPalette(value as PaletteId)}
            aria-label="Background palette"
            className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3"
          >
            {PALETTES.map((p) => (
              <ThemeCard
                key={p.id}
                value={p.id}
                name={p.name}
                colours={p[theme]}
              />
            ))}
            <ThemeCard
              value={PALETTE.CUSTOM}
              name="Custom"
              colours={
                appearance.palette === PALETTE.CUSTOM
                  ? {
                      background: customBackground,
                      foreground: pickForeground(customBackground),
                    }
                  : null
              }
            />
          </RadioGroupPrimitive.Root>
        </div>
        {appearance.palette === PALETTE.CUSTOM && (
          <>
            <BackgroundField
              mode={THEME.LIGHT}
              label="Light mode background"
              value={appearance.customBackground.light}
              onChange={setCustomBackground}
            />
            <BackgroundField
              mode={THEME.DARK}
              label="Dark mode background"
              value={appearance.customBackground.dark}
              onChange={setCustomBackground}
            />
          </>
        )}
      </SettingsGroup>

      <SettingsGroup title="Text">
        <SettingsRow
          label="Text size"
          description="Long couplets may scroll sideways on small windows at larger sizes."
        >
          <ToggleGroup
            type="single"
            value={appearance.fontSize}
            onValueChange={(v) => {
              if (v) setFontSize(v as FontSizeId);
            }}
            aria-label="Text size"
          >
            {FONT_SIZES.map((s) => (
              <ToggleGroupItem key={s.id} value={s.id}>
                {s.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup
        title="Tamil font"
        description="Used for the couplet and the Tamil meaning."
      >
        <RadioGroupPrimitive.Root
          value={appearance.tamilFont}
          onValueChange={(value) => setTamilFont(value as TamilFontId)}
          aria-label="Tamil font"
          className="grid grid-cols-1 gap-px sm:grid-cols-2"
        >
          {TAMIL_FONTS.map((f) => (
            <RadioGroupPrimitive.Item
              key={f.id}
              value={f.id}
              className="group flex items-start justify-between gap-3 px-5 py-4 text-left outline-none hover:bg-accent/60 focus-visible:bg-accent data-[state=checked]:bg-accent"
            >
              <div>
                <div
                  className="mb-1 text-xl text-foreground"
                  style={{ fontFamily: f.family }}
                >
                  அகர முதல
                </div>
                <div className="text-sm text-foreground">{f.name}</div>
                <div className="text-xs text-muted-foreground">
                  {f.description}
                </div>
              </div>
              <Check
                className={cn(
                  "mt-1 size-4 shrink-0 text-foreground opacity-0 group-data-[state=checked]:opacity-100",
                )}
              />
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroupPrimitive.Root>
      </SettingsGroup>

      <div className="flex justify-end">
        <Button variant="muted" size="md" onClick={reset}>
          Reset appearance
        </Button>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  value: PaletteId;
  name: string;
  /** Colours to draw the card in; null draws the empty "+ Custom" card. */
  colours: { background: string; foreground: string } | null;
}

// A miniature of the new tab drawn in the theme's own colours (for the
// current light/dark mode), in the user's Tamil font, so you see how text
// reads on it rather than two abstract colours.
function ThemeCard({ value, name, colours }: ThemeCardProps) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      aria-label={name}
      className="group flex flex-col gap-2 text-left outline-none"
    >
      <span
        className={cn(
          "relative flex h-24 w-full flex-col justify-center gap-1.5 overflow-hidden rounded-lg border px-4 transition-shadow group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50 group-data-[state=checked]:ring-2 group-data-[state=checked]:ring-foreground group-data-[state=checked]:ring-offset-2 group-data-[state=checked]:ring-offset-background",
          colours
            ? "border-border/40"
            : "items-center border-dashed border-muted-foreground/60 text-muted-foreground group-hover:text-foreground",
        )}
        style={
          colours
            ? { backgroundColor: colours.background, color: colours.foreground }
            : undefined
        }
      >
        {colours ? (
          <>
            <span className="font-tamil text-lg leading-tight whitespace-nowrap">
              அகர முதல
            </span>
            <span
              aria-hidden="true"
              className="h-1 w-3/4 rounded-full bg-current opacity-35"
            />
            <span
              aria-hidden="true"
              className="h-1 w-1/2 rounded-full bg-current opacity-35"
            />
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-sm">
            <Plus className="size-4" /> Custom
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 hidden size-5 items-center justify-center rounded-full bg-foreground text-background group-data-[state=checked]:flex"
        >
          <Check className="size-3" />
        </span>
      </span>
      <span className="text-xs text-muted-foreground group-hover:text-foreground group-data-[state=checked]:text-foreground">
        {name}
      </span>
    </RadioGroupPrimitive.Item>
  );
}

interface BackgroundFieldProps {
  mode: ResolvedTheme;
  label: string;
  value: string;
  onChange: (mode: ResolvedTheme, hex: string) => void;
}

// Native colour picker plus a hex field. Typing only saves once the text is a
// valid #rgb / #rrggbb; until then the field shows aria-invalid.
function BackgroundField({
  mode,
  label,
  value,
  onChange,
}: BackgroundFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && normaliseHex(draft) === null;

  return (
    <SettingsRow label={label}>
      {/* One control: colour swatch (native picker) inside the hex field. */}
      <div
        className={cn(
          "flex h-9 w-36 items-center gap-2 rounded-md border border-border/60 pr-2 pl-1.5 focus-within:ring-[3px] focus-within:ring-ring/50",
          invalid && "border-destructive ring-destructive/20",
        )}
      >
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(mode, event.target.value)}
          aria-label={`${label} colour picker`}
          className="size-6 shrink-0 cursor-pointer appearance-none rounded border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-border/60 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <input
          type="text"
          value={draft ?? value}
          onChange={(event) => {
            setDraft(event.target.value);
            const hex = normaliseHex(event.target.value);
            if (hex) onChange(mode, hex);
          }}
          onBlur={() => setDraft(null)}
          aria-label={`${label} hex`}
          aria-invalid={invalid}
          data-testid={`custom-bg-${mode}-hex`}
          spellCheck={false}
          maxLength={7}
          className="h-full min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground uppercase outline-none"
        />
      </div>
    </SettingsRow>
  );
}

export default AppearanceSettings;
