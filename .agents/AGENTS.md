# TrafficSense — Project Context & AI Guidelines

File ini mendefinisikan konteks, aturan, dan detail arsitektur dari proyek **TrafficSense** agar asisten AI berikutnya dapat memahami proyek ini secara keseluruhan.

---

## 1. Deskripsi Proyek
**TrafficSense** adalah sistem deteksi dan klasifikasi Rambu Lalu Lintas Indonesia secara real-time yang didukung oleh kecerdasan buatan (**Deep Learning**). Proyek ini dikembangkan menggunakan model **YOLOv8** untuk inferensi deteksi objek, dengan backend berbasis **FastAPI** dan frontend berbasis **React (Vite)**.

## 2. Fitur Utama
* **Deteksi Rambu Gambar & Video:** Pengguna mengunggah gambar/video lalu sistem menggambar bounding box pada rambu lalu lintas yang terdeteksi secara visual.
* **Deteksi Real-time Kamera (WebSocket):** Aliran video real-time dari kamera HP/PC dikirimkan ke server menggunakan WebSocket dengan framerate optimal.
* **Riwayat Deteksi:** Menyimpan hasil deteksi ke database lokal untuk ditinjau kembali oleh pengguna.
* **Database Informasi Rambu:** Referensi data rambu lalu lintas Indonesia lengkap dengan peraturan hukum, deskripsi, dan kategorisasi rambu.

---

## 3. Struktur Proyek & Berkas Kunci

Proyek terbagi menjadi dua bagian utama:

### A. Backend (FastAPI + Python)
* **Folder:** `backend/`
* **Berkas Penting:**
  * [main.py](file:///d:/TUGAS%20KULIAH%20AFIF%20MUSYAFFA/DL/ProjectDL_Kel5_versi2_maudirevisi%20(1)/ProjectDL_Kel5/backend/main.py): Entry point API, memuat model YOLOv8 saat startup, dan inisialisasi CORS/Database.
  * [predict.py](file:///d:/TUGAS%20KULIAH%20AFIF%20MUSYAFFA/DL/ProjectDL_Kel5_versi2_maudirevisi%20(1)/ProjectDL_Kel5/backend/routers/predict.py): Router endpoint deteksi utama, penanganan file gambar/video, dan WebSocket.
  * [database.py](file:///d:/TUGAS%20KULIAH%20AFIF%20MUSYAFFA/DL/ProjectDL_Kel5_versi2_maudirevisi%20(1)/ProjectDL_Kel5/backend/database.py): Konfigurasi SQLite menggunakan SQLAlchemy.
  * [models/best.pt](file:///d:/TUGAS%20KULIAH%20AFIF%20MUSYAFFA/DL/ProjectDL_Kel5_versi2_maudirevisi%20(1)/ProjectDL_Kel5/backend/models/best.pt): File model bobot latih YOLOv8.

### B. Frontend (React v19 + Vite v8)
* **Folder:** `frontend/`
* **Berkas Penting:**
  * `frontend/src/App.jsx`: Routing halaman web.
  * `frontend/src/pages/`: Halaman web seperti Dashboard, Upload Video/Gambar, Deteksi Kamera, Riwayat, dll.
  * `frontend/src/components/`: Komponen UI modular (Canvas drawing bounding box, cards, layouts).
  * `frontend/src/services/api.js`: Konfigurasi Axios untuk koneksi backend.

---

## 4. Panduan Menjalankan Proyek secara Lokal

### Backend
1. Masuk ke `backend`
2. Gunakan interpreter python dari venv: `.\venv\Scripts\python.exe main.py`
3. Berjalan pada port: `8000` (API documentation di `/docs`)

### Frontend
1. Masuk ke `frontend`
2. Jalankan server pembangunan: `npm run dev`
3. Berjalan pada port: `5173`

---

## 5. Aturan Penting untuk AI
* **Optimasi RAM (Render / Server Minim RAM):** Pada [main.py](file:///d:/TUGAS%20KULIAH%20AFIF%20MUSYAFFA/DL/ProjectDL_Kel5_versi2_maudirevisi%20(1)/ProjectDL_Kel5/backend/main.py), batasi thread PyTorch CPU menjadi 1 (`torch.set_num_threads(1)`) untuk mencegah penolakan memori (Out Of Memory) di server gratisan seperti Render.
* **CORS:** Jangan membatasi origin CORS pada local development (selalu set `allow_origins=["*"]`).
* **Format WebSocket:** WebSocket kamera mengirimkan data gambar dalam bentuk base64 string dan menerima deteksi berformat JSON.
