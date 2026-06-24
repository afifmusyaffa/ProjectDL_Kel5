import React, { useState, useEffect, useCallback } from "react";
import {
  getHistory,
  getHistoryStats,
  deleteHistoryItem,
  clearHistory,
} from "../services/api";
import { SUCCESS_THRESHOLD, SOURCE_LABELS } from "../constants/config";
import { Badge } from "../components/UI/Badge";
import { Button } from "../components/UI/Button";
import { Spinner } from "../components/UI/Spinner";
import { EmptyState } from "../components/UI/EmptyState";
import {
  formatDateTime,
  formatConfidence,
  getConfidenceVariant,
} from "../utils/format";

const ITEMS_PER_PAGE = 20;

/* ================================================================
   SECTION A — Summary Dashboard (sub-components)
   ================================================================ */

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="ds-stat-card" style={{ "--accent": color }}>
      <div className="ds-stat-card__icon">{icon}</div>
      <div className="ds-stat-card__body">
        <span className="ds-stat-card__value">{value}</span>
        <span className="ds-stat-card__label">{label}</span>
        {sub && <span className="ds-stat-card__sub">{sub}</span>}
      </div>
    </div>
  );
}

function ModelComparisonTable({ baseline, overall }) {
  return (
    <div className="ds-comparison">
      <h3 className="ds-section-title">Perbandingan Model vs Aplikasi</h3>
      <div className="table-wrap">
        <table className="data-table ds-compact-table">
          <thead>
            <tr>
              <th>Metrik</th>
              <th>Model (Validasi)</th>
              <th>Aplikasi (Live)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>mAP50 / Success Rate</td>
              <td>
                <Badge variant="success">{baseline.mAP50}%</Badge>
              </td>
              <td>
                <Badge
                  variant={
                    overall.success_rate >= 70
                      ? "success"
                      : overall.success_rate >= 50
                      ? "warning"
                      : "danger"
                  }
                >
                  {overall.success_rate.toFixed(1)}%
                </Badge>
              </td>
            </tr>
            <tr>
              <td>Precision</td>
              <td>{baseline.precision}%</td>
              <td className="ds-muted">—</td>
            </tr>
            <tr>
              <td>Recall</td>
              <td>{baseline.recall}%</td>
              <td className="ds-muted">—</td>
            </tr>
            <tr>
              <td>Avg Confidence</td>
              <td className="ds-muted">—</td>
              <td>{(overall.avg_confidence * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="ds-disclaimer">
        * Success Rate aplikasi diukur dari confidence score deteksi live
        (threshold {(SUCCESS_THRESHOLD * 100).toFixed(0)}%), bukan dari ground
        truth label. Tidak sebanding langsung dengan mAP50.
      </p>
    </div>
  );
}

function SourceBreakdown({ bySource }) {
  const sources = ["image", "video", "camera"];
  return (
    <div className="ds-source-section">
      <h3 className="ds-section-title">Breakdown per Sumber</h3>
      <div className="ds-source-grid">
        {sources.map((src) => {
          const data = bySource[src] || {
            total: 0,
            success: 0,
            failed: 0,
            avg_confidence: 0,
          };
          const pct =
            data.total > 0
              ? ((data.success / data.total) * 100).toFixed(1)
              : 0;
          return (
            <div className="ds-source-card" key={src}>
              <div className="ds-source-card__header">
                <span className="ds-source-card__icon">
                  {src === "image" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  )}
                  {src === "video" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                      <line x1="7" y1="2" x2="7" y2="22"></line>
                      <line x1="17" y1="2" x2="17" y2="22"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <line x1="2" y1="7" x2="7" y2="7"></line>
                      <line x1="2" y1="17" x2="7" y2="17"></line>
                      <line x1="17" y1="17" x2="22" y2="17"></line>
                      <line x1="17" y1="7" x2="22" y2="7"></line>
                    </svg>
                  )}
                  {src === "camera" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  )}
                </span>
                <span className="ds-source-card__title">
                  {SOURCE_LABELS[src]}
                </span>
              </div>
              <div className="ds-source-card__stats">
                <div className="ds-source-card__row">
                  <span>Total</span>
                  <strong>{data.total}</strong>
                </div>
                <div className="ds-source-card__row">
                  <span>Sukses</span>
                  <strong style={{ color: "var(--color-success)" }}>
                    {data.success}
                  </strong>
                </div>
                <div className="ds-source-card__row">
                  <span>Gagal</span>
                  <strong style={{ color: "var(--color-danger)" }}>
                    {data.failed}
                  </strong>
                </div>
                <div className="ds-source-card__row">
                  <span>Avg Confidence</span>
                  <strong>{(data.avg_confidence * 100).toFixed(1)}%</strong>
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="ds-mini-bar">
                <div
                  className="ds-mini-bar__fill ds-mini-bar__fill--success"
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="ds-mini-bar__fill ds-mini-bar__fill--danger"
                  style={{ width: `${100 - pct}%` }}
                />
              </div>
              <div className="ds-mini-bar__labels">
                <span style={{ color: "var(--color-success)" }}>{pct}%</span>
                <span style={{ color: "var(--color-danger)" }}>
                  {(100 - pct).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConfidenceDistribution({ distribution, total }) {
  const bands = [
    {
      key: "very_high",
      label: "Sangat Tinggi (≥90%)",
      color: "#15803d",
    },
    { key: "high", label: "Tinggi (70–89%)", color: "#16a34a" },
    { key: "medium", label: "Sedang (50–69%)", color: "#d97706" },
    { key: "low", label: "Rendah (<50%)", color: "#dc2626" },
  ];

  return (
    <div className="ds-distribution">
      <h3 className="ds-section-title">Distribusi Confidence</h3>
      <div className="ds-distribution__bars">
        {bands.map((band) => {
          const count = distribution[band.key] || 0;
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          return (
            <div className="ds-dist-row" key={band.key}>
              <span className="ds-dist-row__label">{band.label}</span>
              <div className="ds-dist-row__bar-wrap">
                <div
                  className="ds-dist-row__bar"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: band.color,
                  }}
                />
              </div>
              <span className="ds-dist-row__count">
                {count}{" "}
                <span className="ds-dist-row__pct">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopLabels({ labels }) {
  if (!labels || labels.length === 0) return null;
  return (
    <div className="ds-top-labels">
      <h3 className="ds-section-title">Top 5 Rambu Terdeteksi</h3>
      <div className="ds-top-labels__list">
        {labels.map((item, idx) => (
          <div className="ds-top-labels__item" key={item.label}>
            <span className="ds-top-labels__rank">#{idx + 1}</span>
            <div className="ds-top-labels__info">
              <span className="ds-top-labels__name">{item.label}</span>
              <span className="ds-top-labels__meta">
                {item.count}× deteksi · Avg{" "}
                {(item.avg_confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   SECTION B — Tabel Riwayat  (sub-component)
   ================================================================ */

function HistoryTable({
  history,
  loading,
  error,
  search,
  setSearch,
  sourceFilter,
  setSourceFilter,
  statusFilter,
  setStatusFilter,
  page,
  setPage,
  fetchHistory,
  deleteItem,
  clearAll,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  // Apply filters
  let filtered = history;
  if (search) {
    filtered = filtered.filter((h) =>
      h.class_name.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (sourceFilter) {
    filtered = filtered.filter((h) => h.source === sourceFilter);
  }
  if (statusFilter === "success") {
    filtered = filtered.filter((h) => h.confidence >= SUCCESS_THRESHOLD);
  } else if (statusFilter === "fail") {
    filtered = filtered.filter((h) => h.confidence < SUCCESS_THRESHOLD);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
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
    <div className="ds-table-section">
      <div className="ds-table-header">
        <h3 className="ds-section-title">Riwayat Deteksi</h3>
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

      {/* Filters */}
      <div className="ds-filters">
        <input
          type="search"
          className="search-bar__input"
          placeholder="Cari nama rambu..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            setConfirmClear(false);
          }}
          aria-label="Cari riwayat deteksi"
        />

        <div className="ds-filter-tabs">
          <span className="ds-filter-label">Sumber:</span>
          {[
            { val: "", label: "Semua" },
            { val: "image", label: "Gambar" },
            { val: "video", label: "Video" },
            { val: "camera", label: "Kamera" },
          ].map((opt) => (
            <button
              key={opt.val}
              className={`ds-filter-btn ${
                sourceFilter === opt.val ? "ds-filter-btn--active" : ""
              }`}
              onClick={() => {
                setSourceFilter(opt.val);
                setPage(1);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ds-filter-tabs">
          <span className="ds-filter-label">Status:</span>
          {[
            { val: "", label: "Semua" },
            { val: "success", label: "Sukses" },
            { val: "fail", label: "Gagal" },
          ].map((opt) => (
            <button
              key={opt.val}
              className={`ds-filter-btn ${
                statusFilter === opt.val ? "ds-filter-btn--active" : ""
              }`}
              onClick={() => {
                setStatusFilter(opt.val);
                setPage(1);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="center-content">
          <Spinner />
        </div>
      )}

      {error && <div className="alert alert--error">{error}</div>}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="Tidak ada data"
          description="Tidak ditemukan riwayat yang cocok dengan filter saat ini."
        />
      )}

      {!loading && paged.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Rambu</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Sumber</th>
                  <th>Waktu</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((h, i) => {
                  const isSuccess = h.confidence >= SUCCESS_THRESHOLD;
                  return (
                    <tr key={h.id}>
                      <td className="data-table__num">
                        {(safePage - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td className="data-table__name">{h.class_name}</td>
                      <td>
                        <Badge variant={getConfidenceVariant(h.confidence)}>
                          {formatConfidence(h.confidence)}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={isSuccess ? "success" : "danger"}>
                          {isSuccess ? "Sukses" : "Gagal"}
                        </Badge>
                      </td>
                      <td>
                        <span className="source-tag">
                          {SOURCE_LABELS[h.source] || h.source}
                        </span>
                      </td>
                      <td className="data-table__date">
                        {formatDateTime(h.created_at)}
                      </td>
                      <td>
                        <button
                          className="icon-btn"
                          onClick={() => deleteItem(h.id)}
                          aria-label={`Hapus riwayat ${h.class_name}`}
                          title="Hapus"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ds-pagination">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                ← Sebelumnya
              </Button>
              <span className="ds-pagination__info">
                Halaman {safePage} dari {totalPages} · {filtered.length} entri
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                Selanjutnya →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export function History() {
  // Stats state (Section A)
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // History state (Section B)
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [histError, setHistError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // ── Fetch Stats ────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getHistoryStats();
      setStats(res.data);
    } catch {
      // Silently fail — dashboard shows skeleton
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch History ──────────────────────────────────────────
  const fetchHistoryData = useCallback(async () => {
    setHistLoading(true);
    setHistError(null);
    try {
      const res = await getHistory({ limit: 500 });
      setHistory(res.data);
    } catch {
      setHistError("Gagal memuat riwayat deteksi.");
    } finally {
      setHistLoading(false);
    }
  }, []);

  // ── Delete / Clear ─────────────────────────────────────────
  const deleteItem = useCallback(async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      // Refresh stats
      fetchStats();
    } catch {
      setHistError("Gagal menghapus riwayat.");
    }
  }, [fetchStats]);

  const handleClearAll = useCallback(async () => {
    try {
      await clearHistory();
      setHistory([]);
      fetchStats();
    } catch {
      setHistError("Gagal menghapus semua riwayat.");
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
    fetchHistoryData();
  }, [fetchStats, fetchHistoryData]);

  // ── Refresh both ───────────────────────────────────────────
  const refreshAll = useCallback(() => {
    fetchStats();
    fetchHistoryData();
  }, [fetchStats, fetchHistoryData]);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Riwayat Deteksi</h1>
            <p className="page-subtitle">
              Analisis performa deteksi rambu lalu lintas
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────
            SECTION A — SUMMARY DASHBOARD
            ───────────────────────────────────────────────────── */}

        {statsLoading && (
          <div className="center-content" style={{ padding: "48px 0" }}>
            <Spinner />
          </div>
        )}

        {!statsLoading && stats && stats.overall.total === 0 && (
          <EmptyState
            title="Belum ada data deteksi"
            description="Coba deteksi gambar, video, atau kamera terlebih dahulu. Dashboard statistik akan muncul setelah data tersedia."
          />
        )}

        {!statsLoading && stats && stats.overall.total > 0 && (
          <div className="ds-dashboard">
            {/* Row 1 — Stat Cards */}
            <div className="ds-stat-grid">
              <StatCard
                label="Total Deteksi"
                value={stats.overall.total}
                color="var(--color-info)"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                }
              />
              <StatCard
                label="Deteksi Sukses"
                value={stats.overall.success}
                sub={`${stats.overall.success_rate.toFixed(1)}%`}
                color="var(--color-success)"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                }
              />
              <StatCard
                label="Deteksi Gagal"
                value={stats.overall.failed}
                sub={`${(
                  100 - stats.overall.success_rate
                ).toFixed(1)}%`}
                color="var(--color-danger)"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                }
              />
              <StatCard
                label="Rata-rata Confidence"
                value={`${(stats.overall.avg_confidence * 100).toFixed(1)}%`}
                color="var(--color-warning)"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                }
              />
            </div>

            {/* Row 2 — Model vs App Comparison */}
            <ModelComparisonTable
              baseline={stats.model_baseline}
              overall={stats.overall}
            />

            {/* Row 3 — Per-Source Breakdown */}
            <SourceBreakdown bySource={stats.by_source} />

            {/* Row 4 — Confidence Distribution */}
            <ConfidenceDistribution
              distribution={stats.confidence_distribution}
              total={stats.overall.total}
            />

            {/* Row 5 — Top Labels */}
            <TopLabels labels={stats.top_labels} />
          </div>
        )}

        {/* ─────────────────────────────────────────────────────
            SECTION B — TABEL RIWAYAT
            ───────────────────────────────────────────────────── */}
        <HistoryTable
          history={history}
          loading={histLoading}
          error={histError}
          search={search}
          setSearch={setSearch}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          page={page}
          setPage={setPage}
          fetchHistory={refreshAll}
          deleteItem={deleteItem}
          clearAll={handleClearAll}
        />
      </div>
    </div>
  );
}
