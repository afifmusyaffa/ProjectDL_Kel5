import React from "react";
import { DetectionCard } from "./DetectionCard";
import { EmptyState } from "../UI/EmptyState";

export function DetectionList({ detections, title = "Hasil Deteksi" }) {
  return (
    <div className="detection-list">
      <div className="detection-list__header">
        <h3 className="detection-list__title">{title}</h3>
        {detections?.length > 0 && (
          <span className="detection-list__count">{detections.length} objek</span>
        )}
      </div>

      {!detections || detections.length === 0 ? (
        <EmptyState
          title="Rambu tidak terdeteksi"
          description="Model tidak mengenali objek rambu atau tingkat keyakinan (confidence) terlalu rendah."
        />
      ) : (
        <div className="detection-list__items">
          {detections.map((det, i) => (
            <DetectionCard key={i} detection={det} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
