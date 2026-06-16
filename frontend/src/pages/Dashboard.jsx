import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { checkHealth } from "../services/api";

const MENU_ITEMS = [
  {
    to: "/camera",
    title: "Deteksi Kamera",
    desc: "Gunakan kamera perangkat untuk deteksi real-time",
    tag: "Real-time",
  },
  {
    to: "/upload/image",
    title: "Upload Gambar",
    desc: "Unggah gambar dan lihat hasil anotasi",
    tag: "Gambar",
  },
  {
    to: "/upload/video",
    title: "Upload Video",
    desc: "Analisis video frame-by-frame",
    tag: "Video",
  },
  {
    to: "/history",
    title: "Riwayat Deteksi",
    desc: "Lihat semua hasil deteksi sebelumnya",
    tag: "Data",
  },
  {
    to: "/signs",
    title: "Informasi Rambu",
    desc: "Database lengkap rambu lalu lintas Indonesia",
    tag: "Referensi",
  },
  {
    to: "/about",
    title: "Tentang Model",
    desc: "Detail arsitektur dan cara kerja YOLOv8",
    tag: "Info",
  },
];

export function Dashboard() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealth()
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: "error", model_loaded: false, model_classes: [] }));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Pilih mode deteksi yang ingin digunakan</p>
        </div>

        {/* Backend status */}
        {health && (
          <div className={`system-status ${health.model_loaded ? "system-status--ok" : "system-status--warn"}`}>
            <div className="system-status__dot" />
            <div className="system-status__body">
              <span className="system-status__label">
                {health.model_loaded
                  ? "Model YOLOv8 aktif dan siap digunakan"
                  : health.status === "error"
                    ? "Backend tidak dapat dijangkau. Pastikan server berjalan."
                    : "Backend aktif, namun model belum termuat. Letakkan best.pt di backend/models/"}
              </span>
              {health.model_classes?.length > 0 && (
                <span className="system-status__classes">
                  {health.model_classes.length} kelas terdeteksi
                </span>
              )}
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="dashboard-grid">
          {MENU_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className="dashboard-card">
              <div className="dashboard-card__tag">{item.tag}</div>
              <h2 className="dashboard-card__title">{item.title}</h2>
              <p className="dashboard-card__desc">{item.desc}</p>
              <div className="dashboard-card__arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
