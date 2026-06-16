import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

let toastQueue = [];
let listeners = [];

function notify() {
  listeners.forEach((fn) => fn([...toastQueue]));
}

export const toast = {
  show(message, type = "info", duration = 4000) {
    const id = Date.now() + Math.random();
    toastQueue.push({ id, message, type });
    notify();
    setTimeout(() => {
      toastQueue = toastQueue.filter((t) => t.id !== id);
      notify();
    }, duration);
  },
  success(msg) {
    this.show(msg, "success");
  },
  error(msg) {
    this.show(msg, "error");
  },
  info(msg) {
    this.show(msg, "info");
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (list) => setToasts(list);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  if (!toasts.length) return null;

  return createPortal(
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>,
    document.body
  );
}
