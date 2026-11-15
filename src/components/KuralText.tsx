import type { Kural } from "@/types/models";

interface KuralTextProps {
  kural: Kural;
}

const LINE_CLASS = "break-keep whitespace-nowrap [overflow-wrap:normal]";

function KuralText({ kural }: KuralTextProps) {
  return (
    <div
      className="mb-5 min-h-[30px] text-left font-tamil text-[32px] leading-[1.4] text-quote max-[600px]:text-[20px]"
      data-testid="kural-text"
    >
      <div className={LINE_CLASS}>{kural.Line1}</div>
      <div className={LINE_CLASS}>{kural.Line2}</div>
    </div>
  );
}

export default KuralText;
