import { useState, useCallback } from "react";
import { predictImage, predictVideo } from "../services/api";

export function useDetection() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const resetState = () => {
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const detectImage = useCallback(async (file) => {
    resetState();
    setLoading(true);
    try {
      const res = await predictImage(file, setProgress);
      setResult(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Deteksi gagal. Pastikan backend berjalan dan file valid.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const detectVideo = useCallback(async (file) => {
    resetState();
    setLoading(true);
    try {
      const res = await predictVideo(file, setProgress);
      setResult(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Pemrosesan video gagal. Pastikan format video didukung.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    result,
    loading,
    error,
    progress,
    detectImage,
    detectVideo,
    resetState,
  };
}
