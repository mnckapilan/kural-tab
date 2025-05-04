import React, { useEffect } from "react";
import { useKural } from "./KuralContext";
import KuralText from "./KuralText";
import KuralMetadata from "./KuralMetadata";
import KuralExplanation from "./KuralExplanation";
import KuralMeaning from "./KuralMeaning";
import { useKuralLayout } from "../hooks/useKuralLayout";

const KuralDisplay: React.FC = () => {
  const { kural, metadata, isLoading, error, refreshKural } = useKural();
  const { textWidth, handleLayoutChange } = useKuralLayout();

  // Add debugging logs
  useEffect(() => {
    console.log("Kural data:", kural);
    console.log("Metadata:", metadata);
  }, [kural, metadata]);

  if (isLoading) {
    return <div className="loading-kural">Loading Thirukkural...</div>;
  }

  if (error || !kural) {
    return (
      <div className="error">
        <div>Failed to load Thirukkural</div>
        {error && <div className="error-message">{error}</div>}
        <button onClick={refreshKural} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="quote-container">
      <div className="quote-number">
        <span>{kural.Number}</span>
      </div>

      <KuralMetadata metadata={metadata} />

      <KuralText kural={kural} onLayoutChanged={handleLayoutChange} />

      <KuralExplanation explanation={kural.Translation} width={textWidth} />

      <KuralMeaning meaning={kural.mv} width={textWidth} />
    </div>
  );
};

export default KuralDisplay;
