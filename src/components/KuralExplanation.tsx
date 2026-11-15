import React from "react";

interface KuralExplanationProps {
  explanation: string;
}

const KuralExplanation: React.FC<KuralExplanationProps> = ({ explanation }) => (
  <div
    className="mb-5 w-[var(--kural-text-width,auto)] text-left text-[20px] leading-normal text-quote max-[600px]:text-base"
    data-testid="kural-translation"
  >
    {explanation}
  </div>
);

export default KuralExplanation;
