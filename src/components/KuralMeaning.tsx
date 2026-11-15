interface KuralMeaningProps {
  meaning: string;
}

function KuralMeaning({ meaning }: KuralMeaningProps) {
  return (
    <div
      className="mb-5 text-left font-tamil text-body leading-normal text-quote sm:text-body-lg"
      data-testid="kural-meaning"
    >
      {meaning}
    </div>
  );
}

export default KuralMeaning;
