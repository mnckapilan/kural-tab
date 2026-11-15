import type { Kural } from "@/types/models";

interface KuralTextProps {
  kural: Kural;
}

const LINE_CLASS = "break-keep whitespace-nowrap [overflow-wrap:normal]";

function KuralText({ kural }: KuralTextProps) {
  return (
    <div
      className="mb-5 min-h-8 text-left font-tamil text-xl text-quote sm:text-kural"
      data-testid="kural-text"
    >
      <div className={LINE_CLASS}>{kural.Line1}</div>
      <div className={LINE_CLASS}>{kural.Line2}</div>
    </div>
  );
}

export default KuralText;
