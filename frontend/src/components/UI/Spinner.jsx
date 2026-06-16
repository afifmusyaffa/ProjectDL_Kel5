import React from "react";

export function Spinner({ size = "md", label = "Memuat..." }) {
  return (
    <div className={`spinner spinner--${size}`} role="status" aria-label={label}>
      <div className="spinner__ring" />
    </div>
  );
}
