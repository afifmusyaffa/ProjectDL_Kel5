import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const WS_PROTOCOL = window.location.protocol === "https:" ? "wss:" : "ws:";
const WS_URL = import.meta.env.VITE_WS_URL || `${WS_PROTOCOL}//${window.location.host}/api`;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

// ── Health ───────────────────────────────────────────────────────────────────
export const checkHealth = () => api.get("/health");

// ── Predict ──────────────────────────────────────────────────────────────────
export const predictImage = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/predict/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};

export const predictVideo = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/predict/video", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};

export const getVideoResult = (videoId) =>
  `${BASE_URL}/predict/video/result/${videoId}`;

// ── History ──────────────────────────────────────────────────────────────────
export const getHistory = (params = {}) =>
  api.get("/history", { params });

export const deleteHistoryItem = (id) =>
  api.delete(`/history/${id}`);

export const clearHistory = () =>
  api.delete("/history");

export const getHistoryStats = () =>
  api.get("/history/stats");

// ── Traffic Signs ────────────────────────────────────────────────────────────
export const getTrafficSigns = () => api.get("/traffic-signs");
export const getTrafficSign = (id) => api.get(`/traffic-signs/${id}`);

// ── WebSocket ────────────────────────────────────────────────────────────────
export const createCameraSocket = () =>
  new WebSocket(`${WS_URL}/predict/ws/camera`);

export { BASE_URL, WS_URL };
