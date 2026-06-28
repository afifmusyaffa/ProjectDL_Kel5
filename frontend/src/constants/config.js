/**
 * TrafficSense — Konfigurasi Konstanta
 *
 * Threshold dan baseline model disimpan di satu file terpisah
 * agar mudah diubah tanpa menyentuh logika komponen.
 */

// Confidence threshold untuk menentukan deteksi Sukses vs Gagal
export const SUCCESS_THRESHOLD = 0.70;

// Baseline performa model dari hasil validasi Ultralytics
export const MODEL_BASELINE = {
  mAP50: 98.5,
  mAP50_95: 82.0,
  precision: 98.2,
  recall: 95.8,
  valImages: 126,
  valInstances: 135,
  numClasses: 21,
};

// Mapping source (English di DB) → label Bahasa Indonesia
export const SOURCE_LABELS = {
  image: "Gambar",
  video: "Video",
  camera: "Kamera",
};

// Daftar 21 label rambu lalu lintas untuk dropdown verifikasi
export const TRAFFIC_SIGN_LABELS = [
  "Larangan Berhenti",
  "Larangan Masuk Bagi Kendaraan Bermotor dan Tidak Bermotor",
  "Peringatan Alat Pemberi Isyarat Lalu Lintas",
  "Peringatan Banyak Pejalan Kaki Menggunakan Zebra Cross",
  "Peringatan Pintu Perlintasan Kereta Api",
  "Peringatan Simpang Tiga Sisi Kiri",
  "Peringatan Penegasan Rambu Tambahan",
  "Perintah Masuk Jalur Kiri",
  "Perintah Pilihan Memasuki Salah Satu Jalur",
  "Petunjuk Area Parkir",
  "Petunjuk Lokasi Pemberhentian Bus",
  "Petunjuk Lokasi Putar Balik",
  "Larangan Parkir",
  "Petunjuk Penyeberangan Pejalan Kaki",
  "Lampu Hijau",
  "Lampu Kuning",
  "Lampu Merah",
  "Larangan Belok Kanan",
  "Larangan Belok Kiri",
  "Larangan Berjalan Terus Wajib Berhenti Sesaat",
  "Larangan Memutar Balik",
];
