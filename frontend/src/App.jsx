import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Camera } from "./pages/Camera";
import { ImageUpload } from "./pages/ImageUpload";
import { VideoUpload } from "./pages/VideoUpload";
import { History } from "./pages/History";
import { Signs } from "./pages/Signs";
import { About } from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing — no navbar */}
        <Route path="/" element={<Landing />} />

        {/* App routes — with navbar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/upload/image" element={<ImageUpload />} />
          <Route path="/upload/video" element={<VideoUpload />} />
          <Route path="/history" element={<History />} />
          <Route path="/signs" element={<Signs />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
