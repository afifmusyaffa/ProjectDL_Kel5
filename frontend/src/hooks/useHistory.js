import { useState, useEffect, useCallback } from "react";
import { getHistory, deleteHistoryItem, clearHistory } from "../services/api";

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistory(params);
      setHistory(res.data);
    } catch (err) {
      setError("Gagal memuat riwayat deteksi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const deleteItem = useCallback(async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      setError("Gagal menghapus riwayat.");
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch {
      setError("Gagal menghapus semua riwayat.");
    }
  }, []);

  return { history, loading, error, fetchHistory, deleteItem, clearAll };
}
