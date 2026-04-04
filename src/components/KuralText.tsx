import React, { useRef, useEffect } from "react";
import { Kural } from "../types/models";

interface KuralTextProps {
  kural: Kural;
  onLayoutChanged?: (width: number) => void;
}

const KuralText: React.FC<KuralTextProps> = ({ kural, onLayoutChanged }) => {
  const kuralRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (kuralRef.current && onLayoutChanged) {
      requestAnimationFrame(() => {
        const kuralLines = kuralRef.current?.querySelectorAll("div") || [];

        if (kuralLines.length >= 2) {
          const widths = Array.from(kuralLines).map((line) => line.offsetWidth);
          const maxWidth = Math.max(...widths);

          if (maxWidth > 0) {
            onLayoutChanged(maxWidth);
          }
        }
      });
    }
  }, [kural, onLayoutChanged]);

  return (
    <div className="quote-text" ref={kuralRef}>
      <div>{kural.Line1}</div>
      <div>{kural.Line2}</div>
    </div>
  );
};

export default KuralText;
