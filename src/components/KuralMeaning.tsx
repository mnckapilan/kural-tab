import React, { forwardRef } from "react";

interface KuralMeaningProps {
  meaning: string;
  width?: number;
}

const KuralMeaning = forwardRef<HTMLDivElement, KuralMeaningProps>(
  ({ meaning, width }, ref) => {
    return (
      <div
        className="quote-mv"
        ref={ref}
        style={{ width: width ? `${width}px` : "auto" }}
      >
        {meaning}
      </div>
    );
  }
);

export default KuralMeaning;
