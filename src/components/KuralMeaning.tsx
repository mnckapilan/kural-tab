import type { MeaningSourceId } from "@/types/models";
import { meaningSourceOf } from "@/lib/contentOptions";

interface KuralMeaningProps {
  meaning: string;
  source: MeaningSourceId;
}

function KuralMeaning({ meaning, source }: KuralMeaningProps) {
  const author = meaningSourceOf(source);
  return (
    <div className="mb-5 text-left" data-testid="kural-meaning">
      <div className="font-tamil text-body leading-normal text-quote sm:text-body-lg">
        {meaning}
      </div>
      <div
        className="mt-1.5 text-sm text-muted-foreground"
        data-testid="kural-meaning-author"
      >
        — <span className="font-tamil">{author.tamil}</span> · {author.english}
      </div>
    </div>
  );
}

export default KuralMeaning;
