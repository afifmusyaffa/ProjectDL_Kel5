import React, { useState } from "react";
import { DropZone } from "../components/Upload/DropZone";
import { Button } from "../components/UI/Button";
import { Spinner } from "../components/UI/Spinner";
import { Badge } from "../components/UI/Badge";
import { DetectionList } from "../components/Detection/DetectionList";
import { useDetection } from "../hooks/useDetection";
import { getVideoResult } from "../services/api";
import { formatFileSize, formatConfidence } from "../utils/format";
import { VerificationModal } from "../components/VerificationModal";

export function VideoUpload() {
  const [file, setFile] = useState(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { result, loading, error, progress, detectVideo, resetState } = useDetection();

  const handleFile = (f) => {
    resetState();
    setFile(f);
    setIsVerified(false);
  };

  const handleDetect = () => {
    if (file) detectVideo(file);
  };

  const handleReset = () => {
    resetState();
    setFile(null);
    setIsVerified(false);
  };

  // Map unique_detections to include history IDs from backend
  const verificationDetections = result?.unique_detections && result?.history_ids
    ? result.unique_detections.map((det, idx) => ({
        id: result.history_ids[idx],
        label: det.class_name,
        confidence: det.confidence,
      })).filter(det => det.id !== undefined)
    : [];

  return (
    <div className="page-wrapper">
      <div className="container container--narrow">
        <div className="page-header">
          <h1 className="page-title">Upload Video</h1>
          <p className="page-subtitle">
            Proses video dan dapatkan hasil deteksi frame-by-frame
          </p>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        {!file ? (
          <DropZone accept="video" onFile={handleFile} />
        ) : (
          <div className="video-result">
            {/* File info */}
            <div className="file-info-card">
              <div className="file-info-card__name">{file.name}</div>
              <div className="file-info-card__meta">{formatFileSize(file.size)}</div>
            </div>

            {/* Actions */}
            <div className="upload-actions">
              {!result && (
                <Button onClick={handleDetect} loading={loading} size="lg">
                  {loading
                    ? `Mengunggah... ${progress > 0 ? `${progress}%` : ""}`
                    : "Proses Video"}
                </Button>
              )}
              <Button variant="ghost" onClick={handleReset} disabled={loading}>
                Ganti Video
              </Button>
            </div>

            {/* Processing indicator */}
            {loading && (
              <div className="video-processing">
                <Spinner />
                <p className="video-processing__text">
                  Memproses video... Ini mungkin membutuhkan waktu beberapa menit
                  tergantung durasi video.
                </p>
                {progress > 0 && (
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="video-result__content">
                <div className="result-summary">
                  <div className="result-summary__item">
                    <div className="result-summary__value">{result.total_detections}</div>
                    <div className="result-summary__label">Total Deteksi</div>
                  </div>
                  <div className="result-summary__item">
                    <div className="result-summary__value">{result.total_frames}</div>
                    <div className="result-summary__label">Total Frame</div>
                  </div>
                  <div className="result-summary__item">
                    <div className="result-summary__value">{result.unique_classes?.length || 0}</div>
                    <div className="result-summary__label">Kelas Unik</div>
                  </div>
                </div>

                {result.unique_detections && result.unique_detections.length > 0 ? (
                  <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                    <DetectionList
                      detections={result.unique_detections}
                      title="Rambu Terdeteksi"
                    />
                  </div>
                ) : (
                  result.unique_classes?.length > 0 && (
                    <div className="detected-classes">
                      <h3 className="detected-classes__title">Rambu Terdeteksi</h3>
                      <div className="detected-classes__list">
                        {result.unique_classes.map((cls) => (
                          <Badge key={cls} variant="primary">{cls}</Badge>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Verification section */}
                {verificationDetections.length > 0 && (
                  <div style={{ marginTop: "16px", marginBottom: "24px", display: "flex", justifyContent: "center" }}>
                    <Button
                      variant={isVerified ? "outline" : "primary"}
                      onClick={() => setIsVerifyOpen(true)}
                      disabled={isVerified}
                      className="btn--verify"
                    >
                      {isVerified ? "✅ Deteksi Telah Diverifikasi" : "Verifikasi Deteksi"}
                    </Button>
                  </div>
                )}

                {/* Video player */}
                <div className="video-player-wrap">
                  <h3 className="video-player-wrap__title">Video Hasil Anotasi</h3>
                  <video
                    className="video-player"
                    controls
                    src={getVideoResult(result.video_id)}
                    aria-label="Video hasil deteksi"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {result && (
        <VerificationModal
          isOpen={isVerifyOpen}
          detections={verificationDetections}
          onSubmit={() => setIsVerified(true)}
          onClose={() => setIsVerifyOpen(false)}
        />
      )}
    </div>
  );
}
