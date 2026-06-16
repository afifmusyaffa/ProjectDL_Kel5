# TrafficSense — Sistem Deteksi Rambu Lalu Lintas Indonesia

Aplikasi web production-ready untuk deteksi dan klasifikasi rambu lalu lintas Indonesia menggunakan **YOLOv8** dan **Computer Vision**.

---

## Struktur Folder

```
ProjectDLAfif/
├── backend/
│   ├── models/
│   │   └── best.pt              ← Model YOLOv8 Anda
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── predict.py           ← Endpoint inferensi
│   │   ├── history.py           ← Endpoint riwayat
│   │   └── signs.py             ← Endpoint data rambu
│   ├── database.py              ← SQLite + SQLAlchemy
│   ├── schemas.py               ← Pydantic models
│   ├── main.py                  ← FastAPI entry point
│   ├── traffic_signs.json       ← Database 22 rambu
│   └── requirements.txt
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── Detection/       ← BoundingBox, DetectionCard, DetectionList
    │   │   ├── Layout/          ← AppLayout, NavBar
    │   │   ├── UI/              ← Button, Badge, Spinner, Toast, EmptyState
    │   │   └── Upload/          ← DropZone
    │   ├── hooks/               ← useCamera, useDetection, useHistory
    │   ├── pages/               ← Landing, Dashboard, Camera, ImageUpload,
    │   │                           VideoUpload, History, Signs, About
    │   ├── services/
    │   │   └── api.js           ← Axios instance + semua API calls
    │   ├── utils/
    │   │   ├── canvas.js        ← Bounding box drawing
    │   │   └── format.js        ← Date/confidence formatting
    │   ├── App.jsx              ← React Router setup
    │   ├── main.jsx             ← React entry point
    │   └── index.css            ← Design system lengkap
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Prasyarat

- **Python** 3.9 atau lebih baru
- **Node.js** v18 atau lebih baru
- **pip** dan **npm** tersedia di PATH

---

## Instalasi & Menjalankan

### 1. Letakkan Model

Pastikan `best.pt` Anda ada di:
```
backend/models/best.pt
```

> Model `best.pt` yang asli adalah **satu file tunggal** PyTorch.
> Jika di-copy menggunakan Windows Explorer dan muncul sebagai folder,
> gunakan cara copy manual atau salin ulang dari sumber aslinya.

### 2. Backend (FastAPI)

```bash
# Masuk ke folder backend
cd backend

# Buat virtual environment (sangat disarankan)
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python main.py
```

Server berjalan di: **http://localhost:8000**
Dokumentasi API: **http://localhost:8000/docs**

### 3. Frontend (React + Vite)

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies (sudah dilakukan otomatis)
npm install

# Jalankan dev server
npm run dev
```

Aplikasi berjalan di: **http://localhost:5173**

---

## Akses dari Smartphone

Karena Vite dikonfigurasi dengan `host: true`, Anda bisa mengakses
dari smartphone di jaringan WiFi yang sama:

1. Cari IP lokal komputer Anda (contoh: `192.168.1.5`)
2. Buka browser smartphone: `http://192.168.1.5:5173`

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/health` | Status backend dan model |
| `POST` | `/predict/image` | Deteksi dari gambar |
| `POST` | `/predict/video` | Deteksi dari video |
| `WS` | `/predict/ws/camera` | Deteksi real-time via WebSocket |
| `GET` | `/history` | Riwayat deteksi |
| `DELETE` | `/history/{id}` | Hapus satu riwayat |
| `DELETE` | `/history` | Hapus semua riwayat |
| `GET` | `/traffic-signs` | Daftar semua rambu |
| `GET` | `/traffic-signs/{id}` | Detail satu rambu |

### Contoh Response Deteksi

```json
{
  "detections": [
    {
      "class_name": "Dilarang Masuk",
      "confidence": 0.9123,
      "bbox": [120.5, 80.2, 350.8, 290.4]
    }
  ],
  "annotated_image": "<base64_string>",
  "total_detections": 1,
  "processing_time_ms": 45.2
}
```

---

## Fitur

- **Deteksi Kamera Real-time** — WebSocket streaming, ~4 fps
- **Upload Gambar** — Drag & drop, preview before/after, annotated output
- **Upload Video** — Frame-by-frame processing, download hasil
- **Riwayat Deteksi** — SQLite, searchable, sortable
- **Database Rambu** — 22 jenis rambu dengan kategori & regulasi
- **Tentang Model** — Pipeline YOLO, dataset info, arsitektur sistem
- **Mobile-first** — Dioptimalkan untuk Android & iPhone

---

## Troubleshooting

### Backend gagal start
```
[ERROR] Gagal memuat model
```
→ Pastikan `best.pt` adalah file PyTorch asli dan ada di `backend/models/`

### Kamera tidak bisa diakses
→ Browser membutuhkan HTTPS untuk akses kamera di production. Di localhost sudah aman.

### CORS Error di frontend
→ Pastikan backend berjalan di port 8000 sebelum membuka frontend

### Video hasil tidak muncul
→ Cek folder `backend/results/` — pastikan ada write permission

---

## Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + Vite 8 + React Router v6 |
| Styling | Vanilla CSS (Design System custom) |
| HTTP | Axios |
| Real-time | WebSocket API |
| Backend | FastAPI + Uvicorn |
| AI | Ultralytics YOLOv8 |
| Database | SQLite + SQLAlchemy |
| Image | OpenCV + Pillow |
