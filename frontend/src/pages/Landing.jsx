import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/UI/Button";

export function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero__content">
          <div className="hero__tag">YOLOv8 &middot; Computer Vision</div>
          <h1 className="hero__title">
            Deteksi Rambu<br />Lalu Lintas Indonesia
          </h1>
          <p className="hero__subtitle">
            Sistem deteksi dan klasifikasi rambu lalu lintas berbasis kecerdasan
            buatan. Gunakan kamera, unggah gambar, atau video untuk analisis
            instan.
          </p>
          <div className="hero__actions">
            <Link to="/dashboard">
              <Button size="lg">Mulai Deteksi</Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="lg">Tentang Sistem</Button>
            </Link>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__card-mock">
            <div className="hero__card-mock-bar" />
            <div className="hero__card-mock-img" />
            <div className="hero__card-mock-line" />
            <div className="hero__card-mock-line hero__card-mock-line--short" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {[
              { label: "Kelas Rambu", value: "22+" },
              { label: "Framework", value: "YOLOv8" },
              { label: "Format Input", value: "3" },
              { label: "Real-time", value: "Ya" },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-item__value">{s.value}</div>
                <div className="stat-item__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Fitur Utama</h2>
          <div className="features__grid">
            {[
              {
                title: "Deteksi Kamera",
                desc: "Arahkan kamera perangkat ke rambu lalu lintas untuk deteksi real-time menggunakan WebSocket.",
              },
              {
                title: "Upload Gambar",
                desc: "Unggah gambar dari galeri dan dapatkan hasil anotasi dengan bounding box dan confidence score.",
              },
              {
                title: "Analisis Video",
                desc: "Proses file video frame-by-frame dan dapatkan video hasil anotasi yang bisa diunduh.",
              },
              {
                title: "Riwayat Deteksi",
                desc: "Seluruh riwayat deteksi tersimpan otomatis dan dapat dicari berdasarkan kelas rambu.",
              },
              {
                title: "Database Rambu",
                desc: "Informasi lengkap tentang 22 jenis rambu lalu lintas Indonesia beserta regulasi terkait.",
              },
              {
                title: "Mobile-first",
                desc: "Dioptimalkan untuk smartphone Android dan iPhone melalui browser tanpa perlu instalasi.",
              },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
