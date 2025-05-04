import React, { useRef, useEffect } from "react";
import { Kural } from "../models";

interface KuralTextProps {
  kural: Kural;
  onLayoutChanged?: (width: number) => void;
}

const KuralText: React.FC<KuralTextProps> = ({ kural, onLayoutChanged }) => {
  const kuralRef = useRef<HTMLDivElement>(null);

  // Add debugging logs
  console.log("KuralText rendering with:", kural);
  console.log("KuralText has onLayoutChanged:", !!onLayoutChanged);

  useEffect(() => {
    if (kuralRef.current && onLayoutChanged) {
      console.log("KuralText effect running, measuring layout");
      requestAnimationFrame(() => {
        const kuralLines = kuralRef.current?.querySelectorAll("div") || [];
        console.log("Found kural lines:", kuralLines.length);

        if (kuralLines.length >= 2) {
          const widths = Array.from(kuralLines).map((line) => line.offsetWidth);
          console.log("Line widths:", widths);
          const maxWidth = Math.max(...widths);

          if (maxWidth > 0) {
            console.log("Calling onLayoutChanged with width:", maxWidth);
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
