import React from "react";

interface KuralExplanationProps {
  explanation: string;
}

const KuralExplanation: React.FC<KuralExplanationProps> = ({ explanation }) => (
  <div className="quote-explanation">{explanation}</div>
);

export default KuralExplanation;
