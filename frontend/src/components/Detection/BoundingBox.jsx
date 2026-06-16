import React, { useEffect, useRef } from "react";
import { drawDetections } from "../../utils/canvas";

export function BoundingBox({ detections, videoRef, imageRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const source = imageRef?.current || videoRef?.current;
    if (!source) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const naturalW = source.naturalWidth || source.videoWidth || source.offsetWidth;
    const naturalH = source.naturalHeight || source.videoHeight || source.offsetHeight;
    const displayW = source.offsetWidth;
    const displayH = source.offsetHeight;

    canvas.width = displayW;
    canvas.height = displayH;

    const scaleX = displayW / (naturalW || displayW);
    const scaleY = displayH / (naturalH || displayH);

    drawDetections(canvas, detections, scaleX, scaleY);
  }, [detections, videoRef, imageRef]);

  return (
    <canvas
      ref={canvasRef}
      className="bounding-box-canvas"
      aria-hidden="true"
    />
  );
}
