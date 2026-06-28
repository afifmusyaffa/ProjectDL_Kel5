import React, { useState, useCallback } from "react";
import { verifyDetections } from "../services/api";
import { toast } from "./UI/Toast";
import { TRAFFIC_SIGN_LABELS, SUCCESS_THRESHOLD } from "../constants/config";

/**
 * VerificationModal — Komponen reusable untuk verifikasi manual hasil deteksi.
 *
 * Props:
 *   isOpen       boolean   — show/hide modal
 *   detections   array     — [{ id, label, confidence }]
 *   onSubmit     function  — dipanggil setelah verifikasi berhasil
 *   onClose      function  — dipanggil saat user menutup modal
 */
export function VerificationModal({ isOpen, detections = [], onSubmit, onClose }) {
  // State: satu entry per detection — { isCorrect, correctedLabel }
  const [items, setItems] = useState(() =>
    detections.map(() => ({ isCorrect: true, correctedLabel: "" }))
  );
  const [submitting, setSubmitting] = useState(false);

  // Reset items when detections change
  React.useEffect(() => {
    setItems(detections.map(() => ({ isCorrect: true, correctedLabel: "" })));
  }, [detections]);

  const toggleCorrect = useCallback((idx, correct) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, isCorrect: correct, correctedLabel: correct ? "" : item.correctedLabel }
          : item
      )
    );
  }, []);

  const setCorrectedLabel = useCallback((idx, label) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, correctedLabel: label } : item
      )
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const verifications = detections.map((det, i) => ({
        id: det.id,
        is_correct: items[i].isCorrect,
        corrected_label: items[i].isCorrect ? null : items[i].correctedLabel || null,
      }));
      await verifyDetections(verifications);
      toast.success("Verifikasi tersimpan!");
      onSubmit?.();
      onClose?.();
    } catch {
      toast.error("Gagal menyimpan verifikasi");
    } finally {
      setSubmitting(false);
    }
  }, [detections, items, onSubmit, onClose]);

  if (!isOpen || detections.length === 0) return null;

  return (
    <div className="vm-overlay" onClick={onClose}>
      <div className="vm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vm-header">
          <div>
            <h2 className="vm-title">Verifikasi Hasil Deteksi</h2>
            <p className="vm-subtitle">
              Periksa apakah label yang dideteksi model sudah benar
            </p>
          </div>
          <button className="vm-close" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {/* Body — list of detections */}
        <div className="vm-body">
          {detections.map((det, idx) => {
            const item = items[idx];
            if (!item) return null;
            const isSuccess = det.confidence >= SUCCESS_THRESHOLD;

            return (
              <div className="vm-item" key={det.id}>
                <div className="vm-item__info">
                  <span className="vm-item__num">{idx + 1}</span>
                  <div className="vm-item__label-wrap">
                    <span className="vm-item__label">{det.label}</span>
                    <span className={`vm-item__conf ${isSuccess ? "vm-item__conf--success" : "vm-item__conf--fail"}`}>
                      {(det.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Toggle: Benar / Salah */}
                <div className="vm-item__actions">
                  <button
                    className={`vm-toggle-btn ${item.isCorrect ? "vm-toggle-btn--active-correct" : ""}`}
                    onClick={() => toggleCorrect(idx, true)}
                    type="button"
                  >
                    ✅ Benar
                  </button>
                  <button
                    className={`vm-toggle-btn ${!item.isCorrect ? "vm-toggle-btn--active-wrong" : ""}`}
                    onClick={() => toggleCorrect(idx, false)}
                    type="button"
                  >
                    ❌ Salah
                  </button>
                </div>

                {/* Dropdown label koreksi — muncul jika Salah */}
                {!item.isCorrect && (
                  <div className="vm-item__correction">
                    <label className="vm-item__correction-label">Label yang benar:</label>
                    <select
                      className="vm-item__select"
                      value={item.correctedLabel}
                      onChange={(e) => setCorrectedLabel(idx, e.target.value)}
                    >
                      <option value="">— Pilih label —</option>
                      {TRAFFIC_SIGN_LABELS.map((lbl) => (
                        <option key={lbl} value={lbl}>
                          {lbl}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="vm-footer">
          <button
            className="vm-btn vm-btn--ghost"
            onClick={onClose}
            disabled={submitting}
            type="button"
          >
            Lewati
          </button>
          <button
            className="vm-btn vm-btn--primary"
            onClick={handleSubmit}
            disabled={submitting}
            type="button"
          >
            {submitting ? "Menyimpan..." : "Submit Verifikasi"}
          </button>
        </div>
      </div>
    </div>
  );
}
