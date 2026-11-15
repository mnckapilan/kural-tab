import { useState } from "react";
import { Check, Monitor, Moon, Pipette, Sun } from "lucide-react";
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

const SWATCH_CLASS =
  "group relative flex size-8 items-center justify-center rounded-full border border-border/60 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:ring-2 data-[state=checked]:ring-foreground data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background";

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
  const paletteName =
    appearance.palette === PALETTE.CUSTOM
      ? "Custom"
      : PALETTES.find((p) => p.id === appearance.palette)?.name;

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
        <SettingsRow label="Background" description={paletteName}>
          <RadioGroupPrimitive.Root
            value={appearance.palette}
            onValueChange={(value) => setPalette(value as PaletteId)}
            aria-label="Background palette"
            className="flex flex-wrap gap-2.5"
          >
            {PALETTES.map((p) => {
              const c = p[theme];
              return (
                <RadioGroupPrimitive.Item
                  key={p.id}
                  value={p.id}
                  aria-label={p.name}
                  title={p.name}
                  className={SWATCH_CLASS}
                  style={{
                    background: `linear-gradient(135deg, ${c.background} 50%, ${c.foreground} 50%)`,
                  }}
                />
              );
            })}
            <RadioGroupPrimitive.Item
              value={PALETTE.CUSTOM}
              aria-label="Custom"
              title="Custom"
              className={SWATCH_CLASS}
              style={{
                background: `linear-gradient(135deg, ${customBackground} 50%, ${pickForeground(customBackground)} 50%)`,
              }}
            >
              <Pipette
                aria-hidden="true"
                className="size-3.5 text-foreground mix-blend-difference"
              />
            </RadioGroupPrimitive.Item>
          </RadioGroupPrimitive.Root>
        </SettingsRow>
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
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(mode, event.target.value)}
          aria-label={`${label} colour picker`}
          className="size-8 cursor-pointer rounded-md border border-border/60 bg-transparent p-0.5"
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
          className="h-8 w-24 rounded-md border border-border/60 bg-transparent px-2 font-mono text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
        />
      </div>
    </SettingsRow>
  );
}

export default AppearanceSettings;
