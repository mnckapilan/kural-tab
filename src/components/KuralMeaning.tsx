import React from "react";

interface KuralMeaningProps {
  meaning: string;
}

const KuralMeaning: React.FC<KuralMeaningProps> = ({ meaning }) => (
  <div className="quote-mv" data-testid="kural-meaning">{meaning}</div>
);

export default KuralMeaning;
