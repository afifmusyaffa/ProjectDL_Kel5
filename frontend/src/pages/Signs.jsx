import React, { useState, useEffect } from "react";
import { getTrafficSigns } from "../services/api";
import { Badge } from "../components/UI/Badge";
import { Spinner } from "../components/UI/Spinner";
import { EmptyState } from "../components/UI/EmptyState";
import { getCategoryColor } from "../utils/format";

const CATEGORIES = ["Semua", "Larangan", "Peringatan", "Petunjuk", "Kewajiban"];

export function Signs() {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getTrafficSigns()
      .then((res) => setSigns(res.data))
      .catch(() => setError("Gagal memuat data rambu."))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "Semua"
      ? signs
      : signs.filter((s) => s.category === activeCategory);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Informasi Rambu</h1>
          <p className="page-subtitle">
            Database rambu lalu lintas Indonesia yang dikenali model
          </p>
        </div>

        {/* Category filter */}
        <div className="filter-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${activeCategory === cat ? "filter-tab--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <div className="center-content"><Spinner /></div>}
        {error && <div className="alert alert--error">{error}</div>}

        {!loading && filtered.length === 0 && (
          <EmptyState title="Tidak ada rambu" description="Tidak ditemukan rambu pada kategori ini." />
        )}

        {/* Signs grid */}
        <div className="signs-grid">
          {filtered.map((sign) => (
            <button
              key={sign.id}
              className="sign-card"
              onClick={() => setSelected(sign)}
              aria-label={`Detail rambu ${sign.name}`}
            >
              <div className="sign-card__image" style={{ width: "100%", height: "120px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                {sign.image ? <img src={sign.image} alt={sign.name} style={{ maxHeight: "100px", maxWidth: "100%" }} /> : <span style={{color: "#ccc"}}>No Image</span>}
              </div>
              <div className="sign-card__category">
                <Badge variant={getCategoryColor(sign.category)}>
                  {sign.category}
                </Badge>
              </div>
              <h3 className="sign-card__name">{sign.name}</h3>
              <p className="sign-card__desc">
                {sign.description.slice(0, 80)}
                {sign.description.length > 80 ? "..." : ""}
              </p>
              <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: 500 }}>
                Lihat Detail &rarr;
              </div>
            </button>
          ))}
        </div>

        {/* Detail modal */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={selected.name}
            >
              <div className="modal__header">
                <div>
                  <Badge variant={getCategoryColor(selected.category)}>
                    {selected.category}
                  </Badge>
                  <h2 className="modal__title">{selected.name}</h2>
                </div>
                <button
                  className="modal__close"
                  onClick={() => setSelected(null)}
                  aria-label="Tutup"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="modal__body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "center", margin: "16px 0", backgroundColor: "#f5f5f5", padding: "16px", borderRadius: "8px" }}>
                  {selected.image ? <img src={selected.image} alt={selected.name} style={{ maxHeight: "200px" }} /> : <span style={{color: "#ccc"}}>No Image</span>}
                </div>
                <p className="modal__desc" style={{ marginBottom: "16px" }}><strong>Arti:</strong> {selected.description}</p>
                {selected.function && <p className="modal__desc" style={{ marginBottom: "16px" }}><strong>Fungsi:</strong> {selected.function}</p>}
                {selected.rules && <p className="modal__desc" style={{ marginBottom: "16px" }}><strong>Aturan:</strong> {selected.rules}</p>}
                {selected.regulation && (
                  <div className="modal__regulation">
                    <span className="modal__regulation-label">Regulasi</span>
                    <span>{selected.regulation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
