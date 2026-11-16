// Display lists for the Content settings and the new tab: who wrote each Tamil
// meaning, and the English text styles. The ids live in models.ts. Samples
// are Kural 1, copied from public/data/thirukkural.json.

import {
  MEANING_SOURCE,
  TRANSLATION_SOURCE,
  type Kural,
  type MeaningSourceId,
  type TranslationSourceId,
} from "@/types/models";

export const MEANING_SOURCES: ReadonlyArray<{
  id: MeaningSourceId;
  /** Commentator's name in Tamil */
  tamil: string;
  /** Commentator's name in English */
  english: string;
  sample: string;
}> = [
  {
    id: MEANING_SOURCE.VARADARASANAR,
    tamil: "மு. வரதராசனார்",
    english: "Mu. Varadarasanar",
    sample:
      "எழுத்துக்கள் எல்லாம் அகரத்தை அடிப்படையாக கொண்டிருக்கின்றன. அதுபோல உலகம் கடவுளை அடிப்படையாக கொண்டிருக்கிறது.",
  },
  {
    id: MEANING_SOURCE.PAPPAIAH,
    tamil: "சாலமன் பாப்பையா",
    english: "Solomon Pappaiah",
    sample:
      "எழுத்துக்கள் எல்லாம் அகரத்தில் தொடங்குகின்றன; (அது போல) உலகம் கடவுளில் தொடங்குகிறது.",
  },
  {
    id: MEANING_SOURCE.KARUNANIDHI,
    tamil: "மு. கருணாநிதி",
    english: "M. Karunanidhi",
    sample: "அகரம் எழுத்துக்களுக்கு முதன்மை; ஆதிபகவன், உலகில் வாழும் உயிர்களுக்கு முதன்மை",
  },
];

export const TRANSLATION_SOURCES: ReadonlyArray<{
  id: TranslationSourceId;
  name: string;
  description: string;
  /** Who translated it, as shown in the settings */
  credit: string;
  sample: string;
}> = [
  {
    id: TRANSLATION_SOURCE.TRANSLATION,
    name: "Translation",
    description: "A short, close translation. The default.",
    credit: "Shuddhananda Bharati",
    sample:
      "'A' leads letters; the Ancient Lord Leads and lords the entire world",
  },
  {
    id: TRANSLATION_SOURCE.EXPLANATION,
    name: "Explanation",
    description: "A plain prose explanation of the meaning.",
    credit: "W. H. Drew (1–630) and John Lazarus (631–1330)",
    sample:
      "As the letter A is the first of all letters, so the eternal God is first in the world",
  },
  {
    id: TRANSLATION_SOURCE.COUPLET,
    name: "Verse",
    description: "A rhyming two-line verse translation.",
    credit: "G. U. Pope, 1886",
    sample:
      'A, as its first of letters, every speech maintains; The "Primal Deity" is first through all the world\'s domains',
  },
];

export function meaningSourceOf(id: MeaningSourceId) {
  return MEANING_SOURCES.find((s) => s.id === id) ?? MEANING_SOURCES[0]!;
}

/** The English text for a kural in the chosen style. */
export function englishTextOf(kural: Kural, source: TranslationSourceId) {
  switch (source) {
    case TRANSLATION_SOURCE.EXPLANATION:
      return kural.explanation;
    case TRANSLATION_SOURCE.COUPLET:
      return kural.couplet;
    default:
      return kural.Translation;
  }
}

// Drew translated the first 63 chapters; Lazarus revised his work and
// completed chapters 64-133 (Kural 631 onwards). Both are printed in Pope's
// 1886 edition, the source of the verse.
const LAZARUS_FROM = 631;

/** Who translated a kural's English text in the chosen style. */
export function englishCreditOf(
  kuralNumber: number,
  source: TranslationSourceId,
): string {
  switch (source) {
    case TRANSLATION_SOURCE.EXPLANATION:
      return kuralNumber >= LAZARUS_FROM ? "John Lazarus" : "W. H. Drew";
    case TRANSLATION_SOURCE.COUPLET:
      return "G. U. Pope";
    default:
      return "Shuddhananda Bharati";
  }
}

// In the data the verse's two lines are run together with no space
// ("…every speech maintains;The …"). The join is the one place where a
// lower-case letter or punctuation is directly followed by a capital
// (optionally behind an opening quote). Matches exactly once in 1318 of the
// 1330 verses; the rest keep a single line.
const COUPLET_JOIN = /(?<=[a-z,;:.!?)-])(?=['"(]?[A-Z])/g;

/** Splits a verse couplet into its two lines, or returns it as one. */
export function splitCouplet(text: string): string[] {
  const joins = [...text.matchAll(COUPLET_JOIN)];
  if (joins.length !== 1) return [text];
  const at = joins[0]!.index;
  return [text.slice(0, at), text.slice(at)];
}
