import { useRef, useEffect } from "react";
import type { Kural } from "@/types/models";

interface KuralTextProps {
  kural: Kural;
  onLayoutChanged?: (width: number) => void;
}

const LINE_CLASS = "break-keep whitespace-nowrap [overflow-wrap:normal]";

function KuralText({ kural, onLayoutChanged }: KuralTextProps) {
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
    <div
      className="mb-5 min-h-[30px] text-left font-tamil text-[32px] leading-[1.4] text-quote max-[600px]:text-[20px]"
      data-testid="kural-text"
      ref={kuralRef}
    >
      <div className={LINE_CLASS}>{kural.Line1}</div>
      <div className={LINE_CLASS}>{kural.Line2}</div>
    </div>
  );
}

export default KuralText;
