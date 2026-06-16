import React, { useRef, useCallback } from "react";
import { formatFileSize } from "../../utils/format";

const ACCEPTED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
const ACCEPTED_VIDEOS = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

export function DropZone({
  onFile,
  accept = "image",
  label,
  className = "",
}) {
  const inputRef = useRef(null);
  const accepted = accept === "image" ? ACCEPTED_IMAGES : ACCEPTED_VIDEOS;
  const acceptStr = accepted.join(",");

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!accepted.includes(file.type)) {
        alert(`Format file tidak didukung. Gunakan: ${accepted.join(", ")}`);
        return;
      }
      onFile(file);
    },
    [accepted, onFile]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.currentTarget.classList.remove("dropzone--dragover");
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dropzone--dragover");
  };

  const onDragLeave = (e) => {
    e.currentTarget.classList.remove("dropzone--dragover");
  };

  return (
    <div
      className={`dropzone ${className}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Area upload file"
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptStr}
        className="dropzone__input"
        onChange={(e) => handleFile(e.target.files?.[0])}
        aria-hidden="true"
      />
      <div className="dropzone__content">
        <svg className="dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="dropzone__label">
          {label || `Seret & lepas ${accept === "image" ? "gambar" : "video"} di sini`}
        </p>
        <p className="dropzone__hint">
          atau klik untuk memilih file
        </p>
        <p className="dropzone__formats">
          {accept === "image" ? "JPG, PNG, WebP" : "MP4, MOV, AVI, WebM"}
        </p>
      </div>
    </div>
  );
}
