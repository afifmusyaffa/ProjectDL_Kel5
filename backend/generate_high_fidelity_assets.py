import json
import os
import re

SIGNS = [
    (0, "Larangan Berhenti", "Larangan"),
    (1, "Larangan Masuk Bagi Kendaraan Bermotor dan Tidak Bermotor", "Larangan"),
    (2, "Peringatan Alat Pemberi Isyarat Lalu Lintas", "Peringatan"),
    (3, "Peringatan Banyak Pejalan Kaki Menggunakan Zebra Cross", "Peringatan"),
    (4, "Peringatan Pintu Perlintasan Kereta Api", "Peringatan"),
    (5, "Peringatan Simpang Tiga Sisi Kiri", "Peringatan"),
    (6, "Peringatan Penegasan Rambu Tambahan", "Peringatan"),
    (7, "Perintah Masuk Jalur Kiri", "Kewajiban"),
    (8, "Perintah Pilihan Memasuki Salah Satu Jalur", "Kewajiban"),
    (9, "Petunjuk Area Parkir", "Petunjuk"),
    (10, "Petunjuk Lokasi Pemberhentian Bus", "Petunjuk"),
    (11, "Petunjuk Lokasi Putar Balik", "Petunjuk"),
    (12, "Larangan Parkir", "Larangan"),
    (13, "Petunjuk Penyeberangan Pejalan Kaki", "Petunjuk"),
    (14, "Lampu Hijau", "Lampu Lalu Lintas"),
    (15, "Lampu Kuning", "Lampu Lalu Lintas"),
    (16, "Lampu Merah", "Lampu Lalu Lintas"),
    (17, "Larangan Belok Kanan", "Larangan"),
    (18, "Larangan Belok Kiri", "Larangan"),
    (19, "Larangan Berjalan Terus Wajib Berhenti Sesaat", "Larangan"),
    (20, "Larangan Memutar Balik", "Larangan")
]

public_img_dir = "../frontend/public/images/signs"
os.makedirs(public_img_dir, exist_ok=True)

def generate_svg(idx, name, category, id_str):
    svg_content = ""
    w, h = 200, 200

    # Colors
    RED = "#E31E24"
    YELLOW = "#FFD100"
    BLUE = "#0055A4"
    WHITE = "#FFFFFF"
    BLACK = "#000000"
    GREEN = "#008B45"

    if category == "Larangan":
        # 19: Larangan Berjalan Terus Wajib Berhenti Sesaat (Octagon STOP)
        if "Berhenti Sesaat" in name:
            points = "58,10 142,10 190,58 190,142 142,190 58,190 10,142 10,58"
            svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
            <polygon points="{points}" fill="{RED}" stroke="{WHITE}" stroke-width="6"/>
            <polygon points="61,15 139,15 185,61 185,139 139,185 61,185 15,139 15,61" fill="none" stroke="{WHITE}" stroke-width="2"/>
            <text x="100" y="115" font-family="Arial, sans-serif" font-size="50" font-weight="900" fill="{WHITE}" text-anchor="middle">STOP</text>
            </svg>'''

        # 1: Larangan Masuk (No Entry)
        elif "Masuk Bagi" in name:
            svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
            <circle cx="100" cy="100" r="90" fill="{RED}"/>
            <rect x="30" y="85" width="140" height="30" fill="{WHITE}"/>
            </svg>'''
            
        # Others (Red circle with white inner background)
        else:
            base = f'<circle cx="100" cy="100" r="90" fill="{WHITE}" stroke="{RED}" stroke-width="20"/>'
            icon = ""
            cross = f'<line x1="45" y1="45" x2="155" y2="155" stroke="{RED}" stroke-width="20" stroke-linecap="round"/>'

            if "Berhenti" in name and "Sesaat" not in name:
                icon = f'<text x="100" y="130" font-family="Arial, sans-serif" font-size="90" font-weight="bold" fill="{BLACK}" text-anchor="middle">S</text>'
            elif "Parkir" in name:
                icon = f'<text x="100" y="130" font-family="Arial, sans-serif" font-size="90" font-weight="bold" fill="{BLACK}" text-anchor="middle">P</text>'
            elif "Belok Kanan" in name:
                icon = f'<path d="M 60,140 L 60,100 Q 60,60 100,60 L 120,60 M 110,40 L 140,60 L 110,80" fill="none" stroke="{BLACK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>'
            elif "Belok Kiri" in name:
                icon = f'<path d="M 140,140 L 140,100 Q 140,60 100,60 L 80,60 M 90,40 L 60,60 L 90,80" fill="none" stroke="{BLACK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>'
            elif "Memutar Balik" in name:
                icon = f'<path d="M 120,150 L 120,80 Q 120,50 90,50 Q 60,50 60,80 L 60,150 M 40,130 L 60,150 L 80,130" fill="none" stroke="{BLACK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>'

            svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
            {base}
            {icon}
            {cross}
            </svg>'''

    elif category == "Peringatan":
        base = f'''
        <polygon points="100,10 190,100 100,190 10,100" fill="{YELLOW}" stroke="{BLACK}" stroke-width="6"/>
        <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="{BLACK}" stroke-width="2"/>
        '''
        icon = ""
        if "Alat Pemberi Isyarat" in name:
            icon = f'''<rect x="80" y="50" width="40" height="100" rx="10" fill="{BLACK}"/>
            <circle cx="100" cy="70" r="12" fill="{RED}"/>
            <circle cx="100" cy="100" r="12" fill="{YELLOW}"/>
            <circle cx="100" cy="130" r="12" fill="{GREEN}"/>'''
        elif "Zebra Cross" in name:
            # Stick figure walking over lines
            icon = f'''
            <g fill="none" stroke="{BLACK}" stroke-width="8" stroke-linecap="round">
                <circle cx="100" cy="70" r="10" fill="{BLACK}"/>
                <line x1="100" y1="85" x2="100" y2="120"/>
                <line x1="100" y1="90" x2="80" y2="110"/>
                <line x1="100" y1="90" x2="120" y2="110"/>
                <line x1="100" y1="120" x2="80" y2="150"/>
                <line x1="100" y1="120" x2="120" y2="150"/>
            </g>
            <path d="M 50,160 L 150,160 M 60,170 L 140,170" stroke="{BLACK}" stroke-width="6" stroke-linecap="square"/>
            '''
        elif "Kereta Api" in name:
            # Simple fence for railway crossing
            icon = f'''
            <g stroke="{BLACK}" stroke-width="10" stroke-linecap="round">
                <line x1="60" y1="60" x2="140" y2="140"/>
                <line x1="140" y1="60" x2="60" y2="140"/>
                <line x1="100" y1="40" x2="100" y2="160"/>
            </g>
            <rect x="85" y="140" width="30" height="20" fill="{BLACK}"/>
            '''
        elif "Simpang Tiga Sisi Kiri" in name:
            icon = f'''
            <g fill="none" stroke="{BLACK}" stroke-width="20" stroke-linecap="square">
                <line x1="100" y1="160" x2="100" y2="40"/>
                <line x1="100" y1="100" x2="40" y2="100"/>
            </g>
            '''
        elif "Tambahan" in name:
            icon = f'''
            <path d="M 90,60 L 110,60 L 105,120 L 95,120 Z" fill="{BLACK}"/>
            <circle cx="100" cy="140" r="10" fill="{BLACK}"/>
            '''
        else:
            icon = f'<text x="100" y="120" font-family="Arial" font-size="60" font-weight="bold" fill="{BLACK}" text-anchor="middle">!</text>'

        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {base}
        {icon}
        </svg>'''

    elif category == "Kewajiban":
        base = f'''
        <circle cx="100" cy="100" r="90" fill="{BLUE}"/>
        <circle cx="100" cy="100" r="86" fill="none" stroke="{WHITE}" stroke-width="2"/>
        '''
        icon = ""
        if "Masuk Jalur Kiri" in name:
            # Arrow pointing down-left
            icon = f'''<path d="M 130,60 L 80,110 M 80,110 L 110,110 M 80,110 L 80,80" fill="none" stroke="{WHITE}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>'''
        elif "Memasuki Salah Satu Jalur" in name:
            # Fork arrow
            icon = f'''
            <path d="M 100,160 L 100,100 M 100,100 L 70,70 M 70,70 L 90,70 M 70,70 L 70,90" fill="none" stroke="{WHITE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 100,100 L 130,70 M 130,70 L 110,70 M 130,70 L 130,90" fill="none" stroke="{WHITE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="100" y1="40" x2="100" y2="80" stroke="{WHITE}" stroke-width="6"/>
            '''

        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {base}
        {icon}
        </svg>'''

    elif category == "Petunjuk":
        base = f'''
        <rect x="10" y="10" width="180" height="180" rx="15" fill="{BLUE}"/>
        <rect x="15" y="15" width="170" height="170" rx="10" fill="none" stroke="{WHITE}" stroke-width="3"/>
        '''
        icon = ""
        if "Parkir" in name:
            icon = f'<text x="100" y="130" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="{WHITE}" text-anchor="middle">P</text>'
        elif "Bus" in name:
            icon = f'''
            <rect x="50" y="60" width="100" height="70" rx="10" fill="{WHITE}"/>
            <rect x="60" y="70" width="20" height="20" fill="{BLUE}"/>
            <rect x="90" y="70" width="20" height="20" fill="{BLUE}"/>
            <rect x="120" y="70" width="20" height="20" fill="{BLUE}"/>
            <circle cx="70" cy="140" r="10" fill="{WHITE}"/>
            <circle cx="130" cy="140" r="10" fill="{WHITE}"/>
            <line x1="55" y1="110" x2="145" y2="110" stroke="{BLUE}" stroke-width="4"/>
            '''
        elif "Putar Balik" in name:
            icon = f'''<path d="M 120,150 L 120,80 Q 120,50 90,50 Q 60,50 60,80 L 60,150 M 40,130 L 60,150 L 80,130" fill="none" stroke="{WHITE}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>'''
        elif "Penyeberangan" in name:
            icon = f'''
            <polygon points="100,20 180,100 100,180 20,100" fill="{WHITE}"/>
            <g fill="none" stroke="{BLACK}" stroke-width="8" stroke-linecap="round">
                <circle cx="100" cy="70" r="10" fill="{BLACK}"/>
                <line x1="100" y1="85" x2="100" y2="120"/>
                <line x1="100" y1="90" x2="80" y2="110"/>
                <line x1="100" y1="90" x2="120" y2="110"/>
                <line x1="100" y1="120" x2="80" y2="150"/>
                <line x1="100" y1="120" x2="120" y2="150"/>
            </g>
            <path d="M 50,160 L 150,160 M 60,170 L 140,170" stroke="{BLACK}" stroke-width="6" stroke-linecap="square"/>
            '''

        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {base}
        {icon}
        </svg>'''

    else: # Lampu Lalu Lintas
        base = f'''
        <rect x="50" y="10" width="100" height="180" rx="20" fill="#222222"/>
        <rect x="55" y="15" width="90" height="170" rx="15" fill="none" stroke="#555" stroke-width="2"/>
        '''
        
        c_red = "#550000"
        c_yel = "#554400"
        c_gre = "#004400"
        
        if "Merah" in name: c_red = "#FF0000"
        if "Kuning" in name: c_yel = "#FFD700"
        if "Hijau" in name: c_gre = "#00FF00"
        
        icon = f'''
        <circle cx="100" cy="50" r="22" fill="{c_red}" stroke="#111" stroke-width="4"/>
        <circle cx="100" cy="100" r="22" fill="{c_yel}" stroke="#111" stroke-width="4"/>
        <circle cx="100" cy="150" r="22" fill="{c_gre}" stroke="#111" stroke-width="4"/>
        '''
        
        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {base}
        {icon}
        </svg>'''

    filepath = os.path.join(public_img_dir, f"{id_str}.svg")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg_content)


for idx, name, category in SIGNS:
    safe_name = re.sub(r'[^a-z0-9]', '-', name.lower())
    id_str = f"sign-{idx}-{safe_name[:30]}"
    generate_svg(idx, name, category, id_str)

print("Generated 21 HIGH-FIDELITY SVG images successfully.")
