import type { KuralMetadataResult } from "@/types/models";

interface KuralMetadataProps {
  metadata: KuralMetadataResult | null;
}

const METADATA_CLASS =
  "mb-2.5 min-h-5 text-left text-xs text-muted-foreground sm:mb-4 sm:text-base";

function KuralMetadata({ metadata }: KuralMetadataProps) {
  if (!metadata) {
    return (
      <div className={METADATA_CLASS} data-testid="kural-metadata">
        <div className="italic opacity-70">Metadata unavailable</div>
      </div>
    );
  }

  return (
    <div className={METADATA_CLASS} data-testid="kural-metadata">
      <a
        href={`https://thirukkural.gokulnath.com/#/thirukkuralchapters/${metadata.chapter.number}/thirukkurals`}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block pl-4 text-muted-foreground no-underline transition-colors duration-300 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border before:transition-colors before:duration-300 visited:text-muted-foreground hover:text-quote hover:before:bg-quote active:text-quote"
      >
        <div className="mb-1.5">
          {metadata.section.tamil} – {metadata.section.name}
        </div>
        <div className="relative pl-2.5 before:absolute before:top-1/2 before:-left-4 before:h-px before:w-4 before:bg-border before:transition-colors before:duration-300 group-hover:before:bg-quote">
          {metadata.chapter.tamil} – {metadata.chapter.name}
        </div>
      </a>
    </div>
  );
}

export default KuralMetadata;
