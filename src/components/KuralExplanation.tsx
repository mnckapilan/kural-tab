import React, { forwardRef } from "react";

interface KuralExplanationProps {
  explanation: string;
  width?: number;
}

const KuralExplanation = forwardRef<HTMLDivElement, KuralExplanationProps>(
  ({ explanation, width }, ref) => {
    return (
      <div
        className="quote-explanation"
        ref={ref}
        style={{ width: width ? `${width}px` : "auto" }}
      >
        {explanation}
      </div>
    );
  }
);

KuralExplanation.displayName = "KuralExplanation";

export default KuralExplanation;
