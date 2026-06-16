# Panduan Deployment Cloud (Gratis)
Project TrafficSense (YOLOv8 + FastAPI + React Vite)

Panduan ini akan membantu Anda mendeploy sistem secara online menggunakan akun Anda sendiri, tanpa biaya (100% Gratis). Arsitektur yang kita gunakan:
- **Backend (API & Model YOLO):** Render (via Docker)
- **Frontend (Website UI):** Vercel

---

## TAHAP 1: Persiapan Repository
Pastikan Anda sudah mem-push seluruh *codebase* ke GitHub repository Anda.
Jika belum:
```bash
git add .
git commit -m "Siap deploy"
git push origin main
```

---

## TAHAP 2: Deploy Backend ke Render
Render memberikan akses server gratis (512MB RAM) untuk menjalankan Python dan Docker.

1. Buka browser dan daftar/login ke **[Render.com](https://render.com/)**.
2. Hubungkan akun GitHub Anda saat mendaftar.
3. Di Dashboard Render, klik **"New"** > **"Blueprint"**.
4. Pilih repository GitHub project Anda (`ProjectDL_Kel5`).
5. Render akan mendeteksi file `render.yaml` di dalam root project secara otomatis. 
6. Klik **"Apply"** atau **"Deploy"**.
7. Render akan mulai mem-build Docker image (proses ini bisa memakan waktu 5-10 menit karena menginstall PyTorch).
8. Setelah statusnya `Live`, klik URL yang diberikan (misalnya `https://trafficsense-api.onrender.com`).
9. Tambahkan `/health` di akhir URL tersebut (misalnya `https://trafficsense-api.onrender.com/health`). Jika muncul JSON bertuliskan `"status": "ok"`, maka backend telah berhasil!
10. **CATAT URL BACKEND ANDA** (contoh: `https://trafficsense-api-xxxx.onrender.com`). Anda akan membutuhkannya di Tahap 3.

*Catatan Render Gratis:*
- *Server akan "tertidur" (spin-down) jika tidak ada aktivitas selama 15 menit. Saat Anda membuka web pertama kali setelah tertidur, butuh ~30 detik untuk loading kembali.*
- *Database History akan terhapus saat server di-restart. Ini normal.*

---

## TAHAP 3: Deploy Frontend ke Vercel

1. Buka browser dan daftar/login ke **[Vercel.com](https://vercel.com/)**.
2. Hubungkan dengan akun GitHub Anda.
3. Di Dashboard Vercel, klik **"Add New..."** > **"Project"**.
4. Pilih (Import) repository GitHub `ProjectDL_Kel5` Anda.
5. Pada bagian **"Framework Preset"**, biarkan terdeteksi sebagai **Vite**.
6. Pada bagian **"Root Directory"**, klik tombol *Edit* dan pilih folder **`frontend`**.
7. Buka menu akordeon **"Environment Variables"**. Tambahkan dua variabel berikut:
   - **Name:** `VITE_API_URL`
   - **Value:** Masukkan URL Backend dari Render (contoh: `https://trafficsense-api-xxxx.onrender.com`) - *Pastikan TANPA garis miring `/` di akhir URL*.
   - Tambahkan variabel kedua:
   - **Name:** `VITE_WS_URL`
   - **Value:** Masukkan URL Backend Render Anda, namun ganti `https://` menjadi `wss://` (contoh: `wss://trafficsense-api-xxxx.onrender.com`).
8. Klik tombol **Deploy**.
9. Tunggu sekitar 1 menit. Jika berhasil, Vercel akan memberikan domain gratis (misal: `https://project-dl-kel5.vercel.app`).
10. **SELESAI!** Kunjungi domain Vercel Anda dan cobalah fitur deteksi rambu dari handphone maupun komputer mana saja.

---

### Solusi Masalah Umum (Troubleshooting)
- **Website Blank saat di-refresh pada menu tertentu:** Vercel menggunakan `vercel.json` untuk *rewrites* rute React. File ini sudah ditambahkan. Pastikan Anda tidak menghapusnya.
- **Deteksi Gagal / Loading Terus Menerus:** Ini biasanya terjadi jika server Render sedang *tertidur*. Tunggu sekitar 30 detik hingga 1 menit untuk pemanasan (spin-up), lalu coba klik tombol "Analisis" lagi.
- **Out of Memory (OOM) di Render:** Batas RAM 512MB sangat ketat. File `Dockerfile` telah diatur menggunakan PyTorch CPU dan hanya *1 Worker* untuk menghemat memori. Jika masih error, cobalah me-restart Web Service di Dashboard Render.
