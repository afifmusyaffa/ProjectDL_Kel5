import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { checkHealth } from "../../services/api";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/camera", label: "Kamera" },
  { to: "/upload/image", label: "Gambar" },
  { to: "/upload/video", label: "Video" },
  { to: "/history", label: "Riwayat" },
  { to: "/signs", label: "Rambu" },
  { to: "/about", label: "Tentang" },
];

export function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth();
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/dashboard" className="navbar__brand">
          <span className="navbar__brand-mark" />
          <span className="navbar__brand-text">TrafficSense</span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar__links" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${location.pathname === link.to ? "navbar__link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar__right">
          {/* Backend status indicator */}
          {backendOnline !== null && (
            <div
              className={`status-dot ${backendOnline ? "status-dot--online" : "status-dot--offline"}`}
              title={backendOnline ? "Backend online" : "Backend offline"}
            />
          )}

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? "hamburger--open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="navbar__mobile" aria-label="Navigasi mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__mobile-link ${location.pathname === link.to ? "navbar__mobile-link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
