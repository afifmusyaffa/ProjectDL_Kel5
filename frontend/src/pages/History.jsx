import React, { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { Badge } from "../components/UI/Badge";
import { Button } from "../components/UI/Button";
import { Spinner } from "../components/UI/Spinner";
import { EmptyState } from "../components/UI/EmptyState";
import { formatDateTime, formatConfidence, getConfidenceVariant } from "../utils/format";

const SOURCE_LABELS = {
  image: "Gambar",
  video: "Video",
  camera: "Kamera",
};

export function History() {
  const { history, loading, error, fetchHistory, deleteItem, clearAll } = useHistory();
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = history.filter((h) =>
    h.class_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearAll();
    setConfirmClear(false);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Riwayat Deteksi</h1>
            <p className="page-subtitle">{history.length} entri tersimpan</p>
          </div>
          <div className="page-header__actions">
            <Button variant="ghost" size="sm" onClick={() => fetchHistory()}>
              Refresh
            </Button>
            {history.length > 0 && (
              <Button
                variant={confirmClear ? "danger" : "outline"}
                size="sm"
                onClick={handleClear}
              >
                {confirmClear ? "Yakin? Klik lagi" : "Hapus Semua"}
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        {history.length > 0 && (
          <div className="search-bar">
            <input
              type="search"
              className="search-bar__input"
              placeholder="Cari nama rambu..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setConfirmClear(false);
              }}
              aria-label="Cari riwayat deteksi"
            />
          </div>
        )}

        {loading && (
          <div className="center-content">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="alert alert--error">{error}</div>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState
            title="Belum ada riwayat"
            description="Hasil deteksi akan tersimpan di sini setelah Anda menggunakan fitur kamera, gambar, atau video."
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Rambu</th>
                  <th>Confidence</th>
                  <th>Sumber</th>
                  <th>Waktu</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, i) => (
                  <tr key={h.id}>
                    <td className="data-table__num">{i + 1}</td>
                    <td className="data-table__name">{h.class_name}</td>
                    <td>
                      <Badge variant={getConfidenceVariant(h.confidence)}>
                        {formatConfidence(h.confidence)}
                      </Badge>
                    </td>
                    <td>
                      <span className="source-tag">
                        {SOURCE_LABELS[h.source] || h.source}
                      </span>
                    </td>
                    <td className="data-table__date">{formatDateTime(h.created_at)}</td>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => deleteItem(h.id)}
                        aria-label={`Hapus riwayat ${h.class_name}`}
                        title="Hapus"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
