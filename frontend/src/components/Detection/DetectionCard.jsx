import React from "react";
import { Badge } from "../UI/Badge";
import { formatConfidence, getConfidenceVariant, getCategoryColor } from "../../utils/format";

export function DetectionCard({ detection, index }) {
  const { class_name, confidence, bbox, description, category, image } = detection;
  const variant = getConfidenceVariant(confidence);

  return (
    <div className="detection-card" style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <div className="detection-card__index">{index + 1}</div>
      {image && (
        <img src={image} alt={class_name} style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "8px", flexShrink: 0 }} />
      )}
      <div className="detection-card__body" style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
          <span className="detection-card__name" style={{ fontWeight: 600 }}>{class_name}</span>
          {category && <Badge variant={getCategoryColor(category)}>{category}</Badge>}
        </div>
        {description && (
          <p className="detection-card__description" style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginTop: "4px", lineHeight: "1.4" }}>
            {description}
          </p>
        )}
        {bbox && (
          <span className="detection-card__bbox" style={{ marginTop: "4px", display: "block" }}>
            Box: [{bbox.map((b) => Math.round(b)).join(", ")}]
          </span>
        )}
      </div>
      <Badge variant={variant}>{formatConfidence(confidence)}</Badge>
    </div>
  );
}
