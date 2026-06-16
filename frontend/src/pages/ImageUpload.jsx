import React, { useState, useRef } from "react";
import { DropZone } from "../components/Upload/DropZone";
import { DetectionList } from "../components/Detection/DetectionList";
import { Button } from "../components/UI/Button";
import { Spinner } from "../components/UI/Spinner";
import { BoundingBox } from "../components/Detection/BoundingBox";
import { useDetection } from "../hooks/useDetection";
import { formatFileSize } from "../utils/format";

export function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const imageRef = useRef(null);

  const { result, loading, error, progress, detectImage, resetState } = useDetection();

  const handleFile = (f) => {
    resetState();
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDetect = () => {
    if (file) detectImage(file);
  };

  const handleReset = () => {
    resetState();
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div className="page-wrapper">
      <div className="container container--narrow">
        <div className="page-header">
          <h1 className="page-title">Upload Gambar</h1>
          <p className="page-subtitle">
            Unggah gambar rambu lalu lintas untuk dianalisis
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        {/* Drop zone */}
        {!preview && (
          <DropZone accept="image" onFile={handleFile} />
        )}

        {/* Preview + Result */}
        {preview && (
          <div className="image-result">
            {/* Before / After */}
            <div className="image-result__panels">
              {/* Original */}
              <div className="image-panel">
                <div className="image-panel__label">Gambar Asli</div>
                <div className="image-panel__frame">
                  <img
                    ref={imageRef}
                    src={preview}
                    alt="Gambar asli"
                    className="image-panel__img"
                  />
                </div>
                <div className="image-panel__meta">
                  {file?.name} &middot; {formatFileSize(file?.size)}
                </div>
              </div>

              {/* Annotated */}
              <div className="image-panel">
                <div className="image-panel__label">Hasil Deteksi</div>
                <div className="image-panel__frame image-panel__frame--result">
                  {loading && (
                    <div className="image-panel__loading">
                      <Spinner />
                      <span>Menganalisis... {progress > 0 ? `${progress}%` : ""}</span>
                    </div>
                  )}
                  {result?.annotated_image && !loading && (
                    <img
                      src={`data:image/jpeg;base64,${result.annotated_image}`}
                      alt="Hasil deteksi"
                      className="image-panel__img"
                    />
                  )}
                  {!result && !loading && (
                    <div className="image-panel__placeholder">
                      Hasil akan muncul di sini
                    </div>
                  )}
                </div>
                {result && (
                  <div className="image-panel__meta">
                    {result.total_detections} deteksi &middot; {result.processing_time_ms}ms
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="upload-actions">
              {!result && (
                <Button onClick={handleDetect} loading={loading} size="lg">
                  Analisis Gambar
                </Button>
              )}
              <Button variant="ghost" onClick={handleReset} disabled={loading}>
                Ganti Gambar
              </Button>
            </div>

            {/* Detections list */}
            {result && (
              <DetectionList detections={result.detections} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
