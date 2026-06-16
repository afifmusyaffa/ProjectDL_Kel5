import React, { useRef, useEffect } from "react";
import { useCamera } from "../hooks/useCamera";
import { BoundingBox } from "../components/Detection/BoundingBox";
import { DetectionList } from "../components/Detection/DetectionList";
import { Button } from "../components/UI/Button";

export function Camera() {
  const {
    videoRef,
    canvasRef,
    isActive,
    facingMode,
    detections,
    error,
    wsStatus,
    startCamera,
    stopCamera,
    toggleFacingMode,
  } = useCamera();

  const overlayCanvasRef = useRef(null);

  // Keep overlay canvas synced with video element size
  useEffect(() => {
    if (!videoRef.current || !overlayCanvasRef.current) return;
    const video = videoRef.current;

    const sync = () => {
      const canvas = overlayCanvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    video.addEventListener("loadedmetadata", sync);
    return () => video.removeEventListener("loadedmetadata", sync);
  }, [videoRef]);

  const wsLabel = {
    connecting: "Menghubungkan...",
    open: "Terhubung",
    disconnected: "Terputus",
    error: "Error",
  }[wsStatus];

  return (
    <div className="page-wrapper">
      <div className="container container--narrow">
        <div className="page-header">
          <h1 className="page-title">Deteksi Kamera</h1>
          <p className="page-subtitle">
            Arahkan kamera ke rambu lalu lintas untuk deteksi otomatis
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        {/* Camera viewport */}
        <div className="camera-viewport">
          <video
            ref={videoRef}
            className="camera-video"
            playsInline
            muted
            autoPlay
            aria-label="Tampilan kamera"
          />
          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          {/* Bounding box overlay */}
          {isActive && (
            <BoundingBox
              detections={detections}
              videoRef={videoRef}
            />
          )}

          {/* WS status badge */}
          {isActive && (
            <div className={`camera-ws-badge camera-ws-badge--${wsStatus}`}>
              {wsLabel}
            </div>
          )}

          {/* Placeholder when camera off */}
          {!isActive && !error && (
            <div className="camera-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <p>Kamera belum aktif</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="camera-controls">
          {!isActive ? (
            <Button size="lg" onClick={() => startCamera()} className="camera-controls__btn">
              Aktifkan Kamera
            </Button>
          ) : (
            <>
              <Button variant="outline" size="lg" onClick={stopCamera}>
                Hentikan
              </Button>
              <Button variant="ghost" size="lg" onClick={toggleFacingMode}>
                {facingMode === "environment" ? "Kamera Depan" : "Kamera Belakang"}
              </Button>
            </>
          )}
        </div>

        {/* Detection results */}
        {isActive && (
          <DetectionList detections={detections} title="Deteksi Saat Ini" />
        )}
      </div>
    </div>
  );
}
