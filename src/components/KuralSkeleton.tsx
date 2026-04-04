import React from "react";

const KuralSkeleton: React.FC = () => (
  <div className="quote-container">
    <div className="skeleton-number" />
    <div className="skeleton-metadata" />
    <div className="skeleton-text">
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line--short" />
    </div>
    <div className="skeleton-block" />
    <div className="skeleton-block skeleton-block--short" />
  </div>
);

export default KuralSkeleton;
