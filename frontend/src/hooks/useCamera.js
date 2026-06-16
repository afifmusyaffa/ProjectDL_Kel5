import { useState, useRef, useCallback, useEffect } from "react";
import { createCameraSocket } from "../services/api";

const FRAME_INTERVAL_MS = 250; // ~4 fps to backend

export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // rear cam first
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);
  const [wsStatus, setWsStatus] = useState("disconnected"); // connecting | open | disconnected | error

  const videoRef = useRef(null);
  const canvasRef = useRef(null); // hidden capture canvas
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const stopCamera = useCallback(() => {
    // Stop frame interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    // Stop media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setDetections([]);
    setWsStatus("disconnected");
  }, []);

  const startCamera = useCallback(async (facing = facingMode) => {
    setError(null);
    setDetections([]);

    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);

      // Setup WebSocket
      const ws = createCameraSocket();
      socketRef.current = ws;
      setWsStatus("connecting");

      ws.onopen = () => {
        setWsStatus("open");

        // Start sending frames
        intervalRef.current = setInterval(() => {
          if (!videoRef.current || !canvasRef.current) return;
          if (ws.readyState !== WebSocket.OPEN) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result.split(",")[1];
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: "frame", data: base64 }));
                }
              };
              reader.readAsDataURL(blob);
            },
            "image/jpeg",
            0.7
          );
        }, FRAME_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "detections") {
            setDetections(msg.detections);
          }
        } catch (_) {}
      };

      ws.onerror = () => {
        setWsStatus("error");
        setError("Koneksi ke server terputus. Pastikan backend berjalan.");
      };

      ws.onclose = () => {
        setWsStatus("disconnected");
      };
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.");
      } else if (err.name === "NotFoundError") {
        setError("Kamera tidak ditemukan di perangkat ini.");
      } else {
        setError(`Gagal mengakses kamera: ${err.message}`);
      }
      setIsActive(false);
    }
  }, [facingMode]);

  const toggleFacingMode = useCallback(() => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    if (isActive) {
      startCamera(newFacing);
    }
  }, [facingMode, isActive, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isActive,
    facingMode,
    detections,
    error,
    wsStatus,
    startCamera,
    stopCamera,
    toggleFacingMode,
  };
}
