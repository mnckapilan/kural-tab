interface KuralExplanationProps {
  explanation: string;
}

function KuralExplanation({ explanation }: KuralExplanationProps) {
  return (
    <div
      className="mb-5 text-left text-body leading-normal text-quote sm:text-body-lg"
      data-testid="kural-translation"
    >
      {explanation}
    </div>
  );
}

export default KuralExplanation;
