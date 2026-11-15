import React from "react";

interface KuralExplanationProps {
  explanation: string;
}

const KuralExplanation: React.FC<KuralExplanationProps> = ({ explanation }) => (
  <div className="quote-explanation" data-testid="kural-translation">{explanation}</div>
);

export default KuralExplanation;
