/**
 * Format a UTC date string to locale date-time.
 */
export function formatDateTime(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format confidence float (0-1) to percentage string.
 */
export function formatConfidence(value) {
  if (value == null) return "-";
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format file size in bytes to human-readable string.
 */
export function formatFileSize(bytes) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get confidence label: Tinggi / Sedang / Rendah
 */
export function getConfidenceLabel(value) {
  if (value >= 0.8) return "Tinggi";
  if (value >= 0.5) return "Sedang";
  return "Rendah";
}

/**
 * Get badge variant by confidence level
 */
export function getConfidenceVariant(value) {
  if (value >= 0.8) return "success";
  if (value >= 0.5) return "warning";
  return "danger";
}

/**
 * Get category color key
 */
export function getCategoryColor(category) {
  const map = {
    Larangan: "danger",
    Peringatan: "warning",
    Petunjuk: "info",
    Kewajiban: "primary",
  };
  return map[category] || "default";
}
