interface KuralMeaningProps {
  meaning: string;
}

function KuralMeaning({ meaning }: KuralMeaningProps) {
  return (
    <div
      className="mb-5 text-left text-base leading-normal text-quote sm:text-xl"
      data-testid="kural-meaning"
    >
      {meaning}
    </div>
  );
}

export default KuralMeaning;
