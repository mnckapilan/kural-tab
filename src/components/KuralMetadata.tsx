import React from "react";
import { KuralMetadataResult } from "../types/models";

interface KuralMetadataProps {
  metadata: KuralMetadataResult | null;
}

const KuralMetadata: React.FC<KuralMetadataProps> = ({ metadata }) => {
  if (!metadata) {
    return (
      <div className="quote-metadata">
        <div className="metadata-placeholder">Metadata unavailable</div>
      </div>
    );
  }

  return (
    <div className="quote-metadata">
      <a
        href={`https://thirukkural.gokulnath.com/#/thirukkuralchapters/${metadata.chapter.number}/thirukkurals`}
        target="_blank"
        rel="noopener noreferrer"
        className="metadata-tree"
      >
        <div className="section">
          {metadata.section.tamil} – {metadata.section.name}
        </div>
        <div className="chapter">
          {metadata.chapter.tamil} – {metadata.chapter.name}
        </div>
      </a>
    </div>
  );
};

export default KuralMetadata;
