// Display lists for the Appearance settings: labels, descriptions, font
// families and swatch colours. The ids live in models.ts. The CSS that actually
// applies each option is in globals.css ([data-size], [data-font],
// [data-palette]); keep the palette colours below in sync with it.

import {
  FONT_SIZE,
  PALETTE,
  TAMIL_FONT,
  type FontSizeId,
  type PaletteId,
  type TamilFontId,
} from "@/types/models";

export const FONT_SIZES: ReadonlyArray<{
  id: FontSizeId;
  label: string;
  scale: number;
}> = [
  { id: FONT_SIZE.S, label: "S", scale: 0.85 },
  { id: FONT_SIZE.M, label: "M", scale: 1 },
  { id: FONT_SIZE.L, label: "L", scale: 1.15 },
  { id: FONT_SIZE.XL, label: "XL", scale: 1.3 },
];

export const TAMIL_FONTS: ReadonlyArray<{
  id: TamilFontId;
  name: string;
  description: string;
  family: string;
}> = [
  {
    id: TAMIL_FONT.NOTO_SANS,
    name: "Noto Sans Tamil",
    description: "Clean and modern. The default.",
    family: '"Noto Sans Tamil", sans-serif',
  },
  {
    id: TAMIL_FONT.NOTO_SERIF,
    name: "Noto Serif Tamil",
    description: "Traditional serif with a light weight.",
    family: '"Noto Serif Tamil", serif',
  },
  {
    id: TAMIL_FONT.TIRO,
    name: "Tiro Tamil",
    description: "Classical, book-like. Regular weight only.",
    family: '"Tiro Tamil", serif',
  },
  {
    id: TAMIL_FONT.MUKTA,
    name: "Mukta Malar",
    description: "Friendly and slightly rounded.",
    family: '"Mukta Malar", sans-serif',
  },
  {
    id: TAMIL_FONT.HIND,
    name: "Hind Madurai",
    description: "Crisp, compact sans.",
    family: '"Hind Madurai", sans-serif',
  },
  {
    id: TAMIL_FONT.KAVIVANAR,
    name: "Kavivanar",
    description: "Handwritten. Expressive, best for short reads.",
    family: '"Kavivanar", cursive',
  },
];

export interface PaletteColours {
  background: string;
  foreground: string;
  quote: string;
  muted: string;
}

export const PALETTES: ReadonlyArray<{
  id: Exclude<PaletteId, typeof PALETTE.CUSTOM>;
  name: string;
  light: PaletteColours;
  dark: PaletteColours;
}> = [
  {
    id: PALETTE.SLATE,
    name: "Slate",
    light: {
      background: "#d4d4d4",
      foreground: "#1a1a1a",
      quote: "#333333",
      muted: "#434343",
    },
    dark: {
      background: "#1a1a1a",
      foreground: "#f2f2f2",
      quote: "#cccccc",
      muted: "#999999",
    },
  },
  {
    id: PALETTE.PAPER,
    name: "Paper",
    light: {
      background: "#f3ecdc",
      foreground: "#2b2118",
      quote: "#43362a",
      muted: "#6b5a48",
    },
    dark: {
      background: "#221c16",
      foreground: "#efe4d2",
      quote: "#d6c8b2",
      muted: "#a08e78",
    },
  },
  {
    id: PALETTE.PALM_LEAF,
    name: "Palm leaf",
    light: {
      background: "#e6d3a3",
      foreground: "#3a2a12",
      quote: "#4f3a1c",
      muted: "#6e5630",
    },
    dark: {
      background: "#2a2113",
      foreground: "#f0dfb8",
      quote: "#dcc595",
      muted: "#a89066",
    },
  },
  {
    id: PALETTE.INK,
    name: "Ink",
    light: {
      background: "#dde3ec",
      foreground: "#14213d",
      quote: "#26334f",
      muted: "#4a5872",
    },
    dark: {
      background: "#111a2c",
      foreground: "#e6ecf5",
      quote: "#c3cde0",
      muted: "#8592ab",
    },
  },
  {
    id: PALETTE.FOREST,
    name: "Forest",
    light: {
      background: "#dbe4da",
      foreground: "#14261a",
      quote: "#24392a",
      muted: "#47604d",
    },
    dark: {
      background: "#122019",
      foreground: "#e3eee5",
      quote: "#bfd2c4",
      muted: "#84a08c",
    },
  },
];
