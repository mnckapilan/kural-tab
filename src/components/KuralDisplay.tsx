import React, { useEffect, useMemo, useState } from "react";
import { useKural } from "./KuralContext";
import KuralText from "./KuralText";
import KuralMetadata from "./KuralMetadata";
import KuralExplanation from "./KuralExplanation";
import KuralMeaning from "./KuralMeaning";
import { useKuralLayout } from "../hooks/useKuralLayout";

const KuralDisplay: React.FC = () => {
  const {
    kural,
    metadata,
    kuralData,
    favouriteKurals,
    isFavourite,
    toggleFavourite,
    selectKuralByNumber,
    isLoading,
    error,
    refreshKural,
  } = useKural();
  const { textWidth, handleLayoutChange } = useKuralLayout();
  const [showFavourites, setShowFavourites] = useState(false);

  // Add debugging logs
  useEffect(() => {
    console.log("Kural data:", kural);
    console.log("Metadata:", metadata);
  }, [kural, metadata]);

  const favouriteItems = useMemo(() => {
    if (!kuralData) return [];
    const map = new Map(kuralData.kural.map((item) => [item.Number, item]));
    return favouriteKurals
      .map((num) => map.get(num))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [kuralData, favouriteKurals]);

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
        <button
          type="button"
          className={`star-button ${isFavourite(kural.Number) ? "is-starred" : ""}`}
          onClick={() => toggleFavourite(kural.Number)}
          aria-pressed={isFavourite(kural.Number)}
          aria-label={
            isFavourite(kural.Number)
              ? "Remove from favourites"
              : "Add to favourites"
          }
        >
          <svg
            className="star-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path d="M12 3.2l2.62 5.3 5.85.85-4.24 4.13 1 5.83L12 16.9 6.77 19.3l1-5.83L3.5 9.35l5.88-.85L12 3.2z" />
          </svg>
        </button>
      </div>

      <KuralMetadata metadata={metadata} />

      <KuralText kural={kural} onLayoutChanged={handleLayoutChange} />

      <KuralExplanation explanation={kural.Translation} width={textWidth} />

      <KuralMeaning meaning={kural.mv} width={textWidth} />

      <div className="favourites-section">
        <button
          type="button"
          className="favourites-toggle"
          onClick={() => setShowFavourites((prev) => !prev)}
          disabled={favouriteItems.length === 0 && !showFavourites}
        >
          {showFavourites ? "Hide Favourites" : "See Favourites"}
        </button>
        {showFavourites && (
          <div className="favourites-list">
            {favouriteItems.length === 0 && (
              <div className="favourites-empty">No favourites yet.</div>
            )}
            {favouriteItems.map((item) => (
              <div key={item.Number} className="favourites-item">
                <button
                  type="button"
                  className="favourites-select"
                  onClick={() => selectKuralByNumber(item.Number)}
                >
                  <span className="favourites-number">{item.Number}</span>
                  <span className="favourites-text">
                    <span className="favourites-line">{item.Line1}</span>
                    <span className="favourites-line">{item.Line2}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="favourites-remove"
                  onClick={() => toggleFavourite(item.Number)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KuralDisplay;
