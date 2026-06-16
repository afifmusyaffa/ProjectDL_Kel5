import React from "react";

const PIPELINE = [
  {
    step: "01",
    title: "Input Frame",
    desc: "Gambar atau frame video diterima oleh model sebagai tensor piksel berukuran 640×640.",
  },
  {
    step: "02",
    title: "Feature Extraction",
    desc: "Backbone CSPDarknet mengekstrak fitur hierarki dari gambar pada berbagai skala.",
  },
  {
    step: "03",
    title: "Neck (PANet)",
    desc: "Path Aggregation Network menggabungkan fitur dari berbagai level untuk deteksi multi-skala.",
  },
  {
    step: "04",
    title: "Detection Head",
    desc: "Head menghasilkan bounding box, objectness score, dan probabilitas kelas untuk setiap anchor.",
  },
  {
    step: "05",
    title: "NMS",
    desc: "Non-Maximum Suppression memfilter deteksi yang tumpang tindih, menyisakan yang paling confident.",
  },
];

export function About() {
  return (
    <div className="page-wrapper">
      <div className="container container--narrow">
        <div className="page-header">
          <h1 className="page-title">Tentang Model</h1>
          <p className="page-subtitle">
            Detail teknis sistem deteksi berbasis YOLOv8
          </p>
        </div>

        {/* Model info cards */}
        <div className="info-grid">
          {[
            { label: "Model", value: "YOLOv8" },
            { label: "Framework", value: "Ultralytics" },
            { label: "Format", value: "PyTorch (.pt)" },
            { label: "Input Size", value: "640 × 640 px" },
            { label: "Task", value: "Object Detection" },
            { label: "Target", value: "Rambu Indonesia" },
          ].map((item) => (
            <div key={item.label} className="info-card">
              <div className="info-card__label">{item.label}</div>
              <div className="info-card__value">{item.value}</div>
            </div>
          ))}
        </div>

        {/* How YOLO works */}
        <section className="about-section">
          <h2 className="about-section__title">Cara Kerja YOLOv8</h2>
          <p className="about-section__desc">
            YOLO (You Only Look Once) adalah arsitektur deteksi objek satu tahap
            yang memproses seluruh gambar sekaligus dalam satu forward pass, berbeda
            dengan metode dua tahap seperti R-CNN yang memerlukan proposal region
            terlebih dahulu.
          </p>

          <div className="pipeline">
            {PIPELINE.map((p) => (
              <div key={p.step} className="pipeline-item">
                <div className="pipeline-item__step">{p.step}</div>
                <div className="pipeline-item__body">
                  <div className="pipeline-item__title">{p.title}</div>
                  <div className="pipeline-item__desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dataset info */}
        <section className="about-section">
          <h2 className="about-section__title">Dataset</h2>
          <p className="about-section__desc">
            Model dilatih pada dataset rambu lalu lintas Indonesia yang mencakup
            berbagai kondisi pencahayaan, sudut pandang, dan jarak pengambilan gambar.
            Dataset terdiri dari gambar-gambar yang dikumpulkan dari berbagai kota
            di Indonesia dan dianotasi secara manual.
          </p>

          <div className="dataset-stats">
            {[
              { label: "Kelas Rambu", value: "22+" },
              { label: "Kondisi", value: "Siang & Malam" },
              { label: "Variasi", value: "Multi-angle" },
              { label: "Augmentasi", value: "Aktif" },
            ].map((s) => (
              <div key={s.label} className="dataset-stat">
                <div className="dataset-stat__value">{s.value}</div>
                <div className="dataset-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section className="about-section">
          <h2 className="about-section__title">Arsitektur Sistem</h2>
          <div className="arch-diagram">
            {[
              { from: "Browser / Smartphone", arrow: true },
              { from: "React + Vite Frontend", arrow: true },
              { from: "FastAPI Backend", arrow: true },
              { from: "YOLOv8 (best.pt)", arrow: false },
            ].map((a, i) => (
              <React.Fragment key={i}>
                <div className="arch-node">{a.from}</div>
                {a.arrow && (
                  <div className="arch-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
