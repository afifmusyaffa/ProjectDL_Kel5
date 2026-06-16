/**
 * Draw detection bounding boxes on a canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} detections - [{class_name, confidence, bbox: [x1,y1,x2,y2]}]
 * @param {number} scaleX - canvas width / original image width
 * @param {number} scaleY - canvas height / original image height
 */
export function drawDetections(canvas, detections, scaleX = 1, scaleY = 1) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!detections || detections.length === 0) return;

  detections.forEach((det) => {
    const [x1, y1, x2, y2] = det.bbox;
    const sx1 = x1 * scaleX;
    const sy1 = y1 * scaleY;
    const sw = (x2 - x1) * scaleX;
    const sh = (y2 - y1) * scaleY;

    // Bounding box
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx1, sy1, sw, sh);

    // Label background
    const label = `${det.class_name}  ${(det.confidence * 100).toFixed(0)}%`;
    ctx.font = "bold 13px Inter, sans-serif";
    const textW = ctx.measureText(label).width;
    const labelH = 22;
    ctx.fillStyle = "#111111";
    ctx.fillRect(sx1, sy1 - labelH, textW + 12, labelH);

    // Label text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(label, sx1 + 6, sy1 - 6);
  });
}

/**
 * Overlay detections onto a video element using a canvas.
 * Returns a cleanup function.
 */
export function overlayOnVideo(videoEl, canvasEl, detections) {
  if (!videoEl || !canvasEl) return () => {};

  const syncCanvas = () => {
    const rect = videoEl.getBoundingClientRect();
    canvasEl.width = videoEl.videoWidth || rect.width;
    canvasEl.height = videoEl.videoHeight || rect.height;
    canvasEl.style.width = `${rect.width}px`;
    canvasEl.style.height = `${rect.height}px`;
  };

  syncCanvas();
  drawDetections(canvasEl, detections);

  const resizeObserver = new ResizeObserver(syncCanvas);
  resizeObserver.observe(videoEl);
  return () => resizeObserver.disconnect();
}
