interface KuralExplanationProps {
  explanation: string;
}

function KuralExplanation({ explanation }: KuralExplanationProps) {
  return (
    <div
      className="mb-5 text-left text-base leading-normal text-quote sm:text-xl"
      data-testid="kural-translation"
    >
      {explanation}
    </div>
  );
}

export default KuralExplanation;
