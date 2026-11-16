import { TRANSLATION_SOURCE, type TranslationSourceId } from "@/types/models";
import { splitCouplet } from "@/lib/contentOptions";

interface KuralExplanationProps {
  explanation: string;
  source: TranslationSourceId;
  /** Translator's name */
  credit: string;
}

function KuralExplanation({
  explanation,
  source,
  credit,
}: KuralExplanationProps) {
  const lines =
    source === TRANSLATION_SOURCE.COUPLET
      ? splitCouplet(explanation)
      : [explanation];
  return (
    <div className="mb-5 text-left" data-testid="kural-translation">
      <div
        className="text-body leading-normal text-quote sm:text-body-lg"
        data-testid="kural-translation-text"
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div
        className="mt-1.5 text-sm text-muted-foreground"
        data-testid="kural-translation-author"
      >
        — {credit}
      </div>
    </div>
  );
}

export default KuralExplanation;
