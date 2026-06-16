import json
import os
import re

SIGNS = [
    (0, "Larangan Berhenti", "Larangan", "Melarang kendaraan berhenti di sepanjang jalan dengan rambu ini.", "Mencegah kemacetan di area padat.", "Dilarang berhenti sama sekali."),
    (1, "Larangan Masuk Bagi Kendaraan Bermotor dan Tidak Bermotor", "Larangan", "Melarang semua jenis kendaraan untuk masuk ke jalan tersebut.", "Menjaga keamanan atau khusus pejalan kaki.", "Dilarang melintas/masuk."),
    (2, "Peringatan Alat Pemberi Isyarat Lalu Lintas", "Peringatan", "Memberi tahu ada lampu lalu lintas di depan.", "Agar pengemudi bersiap mengurangi kecepatan.", "Waspada lampu lalu lintas."),
    (3, "Peringatan Banyak Pejalan Kaki Menggunakan Zebra Cross", "Peringatan", "Banyak pejalan kaki yang menyeberang.", "Melindungi pejalan kaki.", "Kurangi kecepatan, utamakan pejalan kaki."),
    (4, "Peringatan Pintu Perlintasan Kereta Api", "Peringatan", "Akan ada perlintasan kereta api.", "Mencegah kecelakaan dengan kereta.", "Berhenti sejenak, tengok kanan-kiri."),
    (5, "Peringatan Simpang Tiga Sisi Kiri", "Peringatan", "Ada persimpangan ke kiri di depan.", "Antisipasi kendaraan dari kiri.", "Kurangi kecepatan."),
    (6, "Peringatan Penegasan Rambu Tambahan", "Peringatan", "Rambu ini biasanya disertai papan tambahan di bawahnya.", "Memberi peringatan khusus.", "Perhatikan papan tambahan."),
    (7, "Perintah Masuk Jalur Kiri", "Kewajiban", "Wajib mengambil lajur kiri.", "Mengatur arus lalu lintas searah.", "Tetap di lajur kiri."),
    (8, "Perintah Pilihan Memasuki Salah Satu Jalur", "Kewajiban", "Kendaraan wajib memilih salah satu jalur yang ditunjuk.", "Menghindari separator/pembatas jalan.", "Ikuti salah satu arah panah."),
    (9, "Petunjuk Area Parkir", "Petunjuk", "Menandakan area resmi untuk parkir.", "Memberi info lokasi parkir.", "Boleh memarkirkan kendaraan di area ini."),
    (10, "Petunjuk Lokasi Pemberhentian Bus", "Petunjuk", "Tempat perhentian bus / halte.", "Fasilitas angkutan umum.", "Selain bus dilarang berhenti di area ini."),
    (11, "Petunjuk Lokasi Putar Balik", "Petunjuk", "Lokasi yang diizinkan untuk putar balik (U-turn).", "Fasilitas putar arah.", "Lakukan putar balik dengan aman."),
    (12, "Larangan Parkir", "Larangan", "Melarang kendaraan parkir, namun boleh berhenti sejenak untuk turun/naik penumpang.", "Mencegah penyempitan jalan.", "Dilarang parkir."),
    (13, "Petunjuk Penyeberangan Pejalan Kaki", "Petunjuk", "Lokasi penyeberangan (Zebra Cross).", "Menunjukkan area aman menyeberang.", "Beri jalan pada pejalan kaki."),
    (14, "Lampu Hijau", "Lampu Lalu Lintas", "Lampu lalu lintas menyala hijau.", "Kendaraan boleh jalan.", "Silakan jalan dengan hati-hati."),
    (15, "Lampu Kuning", "Lampu Lalu Lintas", "Lampu lalu lintas menyala kuning.", "Persiapan berhenti atau jalan.", "Hati-hati, kurangi kecepatan."),
    (16, "Lampu Merah", "Lampu Lalu Lintas", "Lampu lalu lintas menyala merah.", "Kendaraan wajib berhenti.", "Berhenti di belakang garis."),
    (17, "Larangan Belok Kanan", "Larangan", "Dilarang berbelok ke kanan di persimpangan.", "Mengatur arus lalu lintas.", "Terus lurus atau belok kiri (sesuai arah lain)."),
    (18, "Larangan Belok Kiri", "Larangan", "Dilarang berbelok ke kiri di persimpangan.", "Mengatur arus lalu lintas.", "Terus lurus atau belok kanan (sesuai arah lain)."),
    (19, "Larangan Berjalan Terus Wajib Berhenti Sesaat", "Larangan", "Wajib berhenti sejenak sebelum melanjutkan perjalanan (Rambu STOP).", "Memastikan kondisi aman sebelum melintas.", "Berhenti total sejenak."),
    (20, "Larangan Memutar Balik", "Larangan", "Dilarang melakukan manuver putar balik (U-turn).", "Menghindari tabrakan atau kemacetan.", "Dilarang putar balik.")
]

json_data = []
public_img_dir = "../frontend/public/images/signs"
os.makedirs(public_img_dir, exist_ok=True)

def generate_svg(id_str, name, category):
    # Base shapes based on category
    if category == "Larangan":
        shape = '<circle cx="100" cy="100" r="90" fill="white" stroke="#d32f2f" stroke-width="20"/>'
        if "Berhenti Sesaat" in name:
             shape = '<polygon points="60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60" fill="#d32f2f" stroke="white" stroke-width="5"/>'
    elif category == "Peringatan":
        shape = '<polygon points="100,10 190,180 10,180" fill="#fbc02d" stroke="black" stroke-width="10"/>'
    elif category == "Kewajiban":
        shape = '<circle cx="100" cy="100" r="90" fill="#1976d2" stroke="white" stroke-width="5"/>'
    elif category == "Petunjuk":
        shape = '<rect x="10" y="10" width="180" height="180" rx="20" fill="#1976d2" stroke="white" stroke-width="5"/>'
    else: # Lampu
        shape = '<rect x="50" y="10" width="100" height="180" rx="20" fill="#212121"/><circle cx="100" cy="100" r="30" fill="gray"/>'
        if "Hijau" in name: shape = '<rect x="50" y="10" width="100" height="180" rx="20" fill="#212121"/><circle cx="100" cy="150" r="25" fill="#388e3c"/>'
        if "Kuning" in name: shape = '<rect x="50" y="10" width="100" height="180" rx="20" fill="#212121"/><circle cx="100" cy="100" r="25" fill="#fbc02d"/>'
        if "Merah" in name: shape = '<rect x="50" y="10" width="100" height="180" rx="20" fill="#212121"/><circle cx="100" cy="50" r="25" fill="#d32f2f"/>'

    abbr = "".join([word[0] for word in name.split() if word.isalnum()])[:3].upper()
    if name == "Larangan Parkir": abbr = "P"
    elif name == "Larangan Berhenti": abbr = "S"
    elif "STOP" in name or "Berhenti Sesaat" in name: abbr = "STOP"

    text_color = "black" if category in ["Peringatan", "Larangan"] else "white"
    if "Berhenti Sesaat" in name: text_color = "white"

    if category == "Larangan" and abbr in ["P", "S"]:
        text_element = f'<text x="100" y="125" font-family="Arial" font-size="80" font-weight="bold" fill="{text_color}" text-anchor="middle">{abbr}</text>'
        text_element += '<line x1="40" y1="40" x2="160" y2="160" stroke="#d32f2f" stroke-width="20"/>'
    elif category == "Larangan":
        text_element = f'<text x="100" y="115" font-family="Arial" font-size="40" font-weight="bold" fill="{text_color}" text-anchor="middle">{abbr}</text>'
        text_element += '<line x1="40" y1="40" x2="160" y2="160" stroke="#d32f2f" stroke-width="20"/>'
    else:
        fontsize = 40 if len(abbr) <= 2 else 30
        if abbr == "STOP": fontsize = 40
        text_element = f'<text x="100" y="115" font-family="Arial" font-size="{fontsize}" font-weight="bold" fill="{text_color}" text-anchor="middle">{abbr}</text>'
        if category == "Lampu Lalu Lintas": text_element = ""

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  {shape}
  {text_element}
</svg>'''
    
    filepath = os.path.join(public_img_dir, f"{id_str}.svg")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg)

for idx, name, category, desc, func, rules in SIGNS:
    safe_name = re.sub(r'[^a-z0-9]', '-', name.lower())
    id_str = f"sign-{idx}-{safe_name[:30]}"
    
    json_data.append({
        "id": id_str,
        "yolo_index": idx,
        "name": name,
        "category": category,
        "description": desc,
        "function": func,
        "rules": rules,
        "image": f"/images/signs/{id_str}.svg"
    })
    
    generate_svg(id_str, name, category)

with open("traffic_signs.json", "w", encoding="utf-8") as f:
    json.dump(json_data, f, indent=2)

print("Generated traffic_signs.json and 21 SVG images successfully.")
