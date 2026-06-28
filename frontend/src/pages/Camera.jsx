import React, { useRef, useEffect, useState, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { BoundingBox } from "../components/Detection/BoundingBox";
import { DetectionList } from "../components/Detection/DetectionList";
import { Button } from "../components/UI/Button";
import { toast } from "../components/UI/Toast";
import { saveCameraDetections } from "../services/api";
import { SUCCESS_THRESHOLD } from "../constants/config";
import { VerificationModal } from "../components/VerificationModal";

// ── Helper: format timestamp Indonesia ────────────────────────────────────
function formatTimestamp(date) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${d} ${m} ${y}, ${hh}.${mm}.${ss}`;
}

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
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // State untuk result card terakhir
  const [lastResult, setLastResult] = useState(null);

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

  // ── Capture frame snapshot dari canvas ──────────────────────────────────
  const captureFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;

    // Pastikan canvas punya dimensi terbaru
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.92);
  }, [canvasRef, videoRef]);

  // ── Simpan Deteksi handler ──────────────────────────────────────────────
  const handleSaveDetection = useCallback(async () => {
    if (isSaving || detections.length === 0) return;

    setIsSaving(true);

    // Capture frame saat ini sebelum async call
    const frameSnapshot = captureFrame();
    const savedDetections = [...detections];
    const timestamp = new Date();

    try {
      const payload = savedDetections.map((d) => ({
        label: d.class_name,
        confidence: d.confidence,
        is_success: d.confidence >= SUCCESS_THRESHOLD,
      }));

      const res = await saveCameraDetections(payload);
      toast.success("Deteksi tersimpan!");

      // Set result card data
      const verifData = savedDetections.map((det, idx) => ({
        id: res.data.saved_ids[idx],
        label: det.class_name,
        confidence: det.confidence,
      })).filter(det => det.id !== undefined);

      setLastResult({
        timestamp,
        frameImage: frameSnapshot,
        detections: savedDetections,
        historyIds: res.data.saved_ids,
        verificationDetections: verifData,
      });
      setIsVerified(false);
    } catch {
      toast.error("Gagal menyimpan, coba lagi");
    } finally {
      // Cooldown 1 detik untuk mencegah double-save
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, [isSaving, detections, captureFrame]);

  const hasDetections = detections.length > 0;

  const wsLabel = {
    connecting: "Menghubungkan...",
    open: "Terhubung",
    disconnected: "Terputus",
    error: "Error",
  }[wsStatus];

  // ── Hitung ringkasan result card ────────────────────────────────────────
  const resultSummary = lastResult
    ? (() => {
        const total = lastResult.detections.length;
        const sukses = lastResult.detections.filter(
          (d) => d.confidence >= SUCCESS_THRESHOLD
        ).length;
        const gagal = total - sukses;
        const avgConf =
          total > 0
            ? lastResult.detections.reduce((s, d) => s + d.confidence, 0) / total
            : 0;
        return { total, sukses, gagal, avgConf };
      })()
    : null;

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
              <Button
                size="lg"
                disabled={!hasDetections || isSaving}
                loading={isSaving}
                onClick={handleSaveDetection}
                className={`btn--save-detection ${hasDetections ? "btn--save-active" : ""}`}
              >
                {isSaving
                  ? "Menyimpan..."
                  : hasDetections
                    ? "Simpan Deteksi"
                    : "Arahkan ke Rambu"}
              </Button>
            </>
          )}
        </div>

        {/* ── Result Card (muncul setelah klik Simpan Deteksi) ──────────── */}
        {lastResult && (
          <div className="detection-result-card">
            {/* Close button */}
            <button
              className="detection-result-card__close"
              onClick={() => setLastResult(null)}
              aria-label="Tutup hasil deteksi"
            >
              ×
            </button>

            {/* Header */}
            <div className="detection-result-card__header">
              <h2 className="detection-result-card__title">Hasil Deteksi Tersimpan</h2>
              <div className="detection-result-card__meta">
                <span>{formatTimestamp(lastResult.timestamp)}</span>
                <span className="detection-result-card__separator">•</span>
                <span>Kamera Live</span>
              </div>
            </div>

            {/* Body: snapshot + table */}
            <div className="detection-result-card__body">
              {/* Snapshot frame */}
              {lastResult.frameImage && (
                <div className="detection-result-card__snapshot">
                  <img
                    src={lastResult.frameImage}
                    alt="Frame saat deteksi"
                    className="detection-result-card__snapshot-img"
                  />
                </div>
              )}

              {/* Detail table */}
              <div className="detection-result-card__details">
                <table className="detection-result-card__table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Rambu</th>
                      <th>Confidence</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastResult.detections.map((d, i) => {
                      const isSuccess = d.confidence >= SUCCESS_THRESHOLD;
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td className="detection-result-card__sign-name">{d.class_name}</td>
                          <td>{(d.confidence * 100).toFixed(1)}%</td>
                          <td>
                            <span
                              className={`detection-result-card__badge ${
                                isSuccess
                                  ? "detection-result-card__badge--success"
                                  : "detection-result-card__badge--fail"
                              }`}
                            >
                              {isSuccess ? "Sukses" : "Gagal"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                 {/* Info ringkas */}
                 {resultSummary && (
                   <div className="detection-result-card__summary">
                     <div className="detection-result-card__stat">
                       <span className="detection-result-card__stat-label">Total Terdeteksi</span>
                       <span className="detection-result-card__stat-value">{resultSummary.total} objek</span>
                     </div>
                     <div className="detection-result-card__stat">
                       <span className="detection-result-card__stat-label">Sukses</span>
                       <span className="detection-result-card__stat-value detection-result-card__stat-value--success">{resultSummary.sukses}</span>
                     </div>
                     <div className="detection-result-card__stat">
                       <span className="detection-result-card__stat-label">Gagal</span>
                       <span className="detection-result-card__stat-value detection-result-card__stat-value--fail">{resultSummary.gagal}</span>
                     </div>
                     <div className="detection-result-card__stat">
                       <span className="detection-result-card__stat-label">Avg Confidence</span>
                       <span className="detection-result-card__stat-value">{(resultSummary.avgConf * 100).toFixed(1)}%</span>
                     </div>
                   </div>
                 )}

                 {/* Verification Button inside Result Card */}
                 {lastResult.historyIds && lastResult.historyIds.length > 0 && (
                   <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
                     <Button
                       variant={isVerified ? "outline" : "primary"}
                       onClick={() => setIsVerifyOpen(true)}
                       disabled={isVerified}
                       className="btn--verify"
                       style={{ width: "100%" }}
                     >
                       {isVerified ? "✅ Deteksi Telah Diverifikasi" : "Verifikasi Deteksi"}
                     </Button>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}

         {/* Detection results (live) */}
         {isActive && (
           <DetectionList detections={detections} title="Deteksi Saat Ini" />
         )}
       </div>

       {/* Verification Modal */}
       {lastResult && (
         <VerificationModal
           isOpen={isVerifyOpen}
           detections={lastResult.verificationDetections || []}
           onSubmit={() => setIsVerified(true)}
           onClose={() => setIsVerifyOpen(false)}
         />
       )}
     </div>
   );
 }
