interface KuralExplanationProps {
  explanation: string;
}

function KuralExplanation({ explanation }: KuralExplanationProps) {
  return (
    <div
      className="mb-5 text-left text-[20px] leading-normal text-quote max-[600px]:text-base"
      data-testid="kural-translation"
    >
      {explanation}
    </div>
  );
}

export default KuralExplanation;
