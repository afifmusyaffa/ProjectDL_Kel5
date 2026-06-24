import React from "react";
import { Badge } from "../UI/Badge";
import { formatConfidence, getConfidenceVariant, getCategoryColor, getConfidenceLabel } from "../../utils/format";

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
            <strong>Arti:</strong> {description}
          </p>
        )}
        {detection.function && (
          <p className="detection-card__function" style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginTop: "2px", lineHeight: "1.4" }}>
            <strong>Fungsi:</strong> {detection.function}
          </p>
        )}
        {detection.rules && (
          <p className="detection-card__rules" style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginTop: "2px", lineHeight: "1.4" }}>
            <strong>Aturan:</strong> {detection.rules}
          </p>
        )}
        <p className="detection-card__confidence" style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginTop: "2px", lineHeight: "1.4" }}>
          <strong>Tingkat Kemiripan:</strong> {formatConfidence(confidence)} ({getConfidenceLabel(confidence)})
        </p>
      </div>
      <Badge variant={variant}>Kecocokan: {formatConfidence(confidence)}</Badge>
    </div>
  );
}
