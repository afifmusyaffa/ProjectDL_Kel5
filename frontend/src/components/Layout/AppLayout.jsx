import React from "react";
import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { ToastContainer } from "../UI/Toast";

export function AppLayout() {
  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container">
          <p className="app-footer__text">
            Sistem Deteksi Rambu Lalu Lintas Indonesia &mdash; YOLOv8
          </p>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}
