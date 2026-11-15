interface KuralMeaningProps {
  meaning: string;
}

function KuralMeaning({ meaning }: KuralMeaningProps) {
  return (
    <div
      className="mb-5 w-[var(--kural-text-width,auto)] text-left text-[20px] leading-normal text-quote max-[600px]:text-base"
      data-testid="kural-meaning"
    >
      {meaning}
    </div>
  );
}

export default KuralMeaning;
