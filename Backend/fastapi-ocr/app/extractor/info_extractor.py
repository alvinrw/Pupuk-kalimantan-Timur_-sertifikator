import re

MONTH_MAP = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
    'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
    'september': '09', 'oktober': '10', 'november': '11', 'desember': '12',
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05',
    'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10',
    'nov': '11', 'dec': '12'
}

def to_iso_date(d_str: str) -> str:
    if not d_str:
        return None
    m = re.search(r'([0-9]{1,2})\s*([A-Za-z]+)\s*([0-9]{4})', d_str)
    if m:
        day = m.group(1).zfill(2)
        month = MONTH_MAP.get(m.group(2).lower(), '01')
        year = m.group(3)
        return f"{year}-{month}-{day}"
    return d_str

def extract_permit_metadata(full_text: str) -> dict:
    lines = [l.strip() for l in full_text.splitlines() if l.strip()]

    # 1. Jenis Dokumen
    doc_type = "SURAT KETERANGAN PERIZINAN"
    for l in lines:
        if any(w in l.upper() for w in ["INSTALASI", "PENYALUR PETIR", "BEJANA TEKAN", "BOILER", "CRANE", "TANGKI TIMBUN"]):
            doc_type = f"SURAT KETERANGAN {l}"
            break
        elif any(w in l.upper() for w in ["SURAT KETERANGAN", "SERTIFIKAT", "PERIZINAN"]):
            doc_type = l
            break

    # 2. Nomor Sertifikat
    cert_no = "UNKNOWN"
    for i, l in enumerate(lines):
        if any(kw in l.lower() for kw in ["no. sertifikat", "no.sertifikat", "nomor sertifikat", "nomor"]):
            if "telp" not in l.lower():
                clean_no = re.sub(r'^(?:Nomor|No|No\. Sertifikat)[\s:\.]*', '', l, flags=re.IGNORECASE).strip()
                if i + 1 < len(lines) and ("/" in lines[i+1] or "-" in lines[i+1]):
                    clean_no += lines[i+1].strip()
                cert_no = clean_no
                break

    cert_no = re.sub(r'\bO(?=\d|\b)', '0', cert_no)

    # 3. Lokasi Objek / Nama Aset
    lokasi = "Unknown Asset"
    for i, l in enumerate(lines):
        if "Lokasi" in l:
            if ":" in l and len(l.split(":", 1)) > 1 and l.split(":", 1)[1].strip():
                lokasi = l.split(":", 1)[1].replace("：", "").strip()
                break
            elif i + 1 < len(lines):
                next_val = lines[i+1].replace(":", "").replace("：", "").strip()
                if next_val:
                    lokasi = next_val
                    break

    # 4. Tanggal-Tanggal
    inspection_date_str = None
    expiry_date_str = None
    issue_date_str = None

    for i, l in enumerate(lines):
        # Tanggal Pemeriksaan Berikutnya (Expiry)
        if any(w in l for w in ["Berikutnya", "Masa Berlaku", "s/d", "s.d.", "Paling lambat"]):
            m = re.search(r'([0-9]{1,2}\s*[A-Za-z]+\s*[0-9]{4})', l)
            if not m and i + 1 < len(lines):
                m = re.search(r'([0-9]{1,2}\s*[A-Za-z]+\s*[0-9]{4})', lines[i+1])
            if m:
                expiry_date_str = m.group(1).strip()

        # Tanggal Pemeriksaan Fisik
        elif "Tanggal Pemeriksaan" in l and "Berikutnya" not in l:
            m = re.search(r'([0-9]{1,2}\s*[A-Za-z]+\s*[0-9]{4})', l)
            if not m and i + 1 < len(lines):
                m = re.search(r'([0-9]{1,2}\s*[A-Za-z]+\s*[0-9]{4})', lines[i+1])
            if m:
                inspection_date_str = m.group(1).strip()

        # Tanggal Terbit Sertifikat (Bontang / Samarinda)
        elif any(city in l for city in ["Samarinda", "Bontang", "Jakarta", "Balikpapan"]):
            m = re.search(r'([0-9]{1,2}\s*[A-Za-z]+\s*[0-9]{4})', l)
            if m:
                issue_date_str = m.group(1).strip()

    # 5. Status Kelayakan Objek
    status_kelayakan = "Layak"
    if any(w in full_text.upper() for w in ["MEMENUHI", "LAIK"]):
        status_kelayakan = "Layak"
    elif any(w in full_text.upper() for w in ["REPAIR", "PERBAIKAN"]):
        status_kelayakan = "Repair"
    elif "TIDAK MEMENUHI" in full_text.upper() or "TIDAK LAIK" in full_text.upper():
        status_kelayakan = "Tidak Layak"

    return {
        "jenis_dokumen": doc_type,
        "nomor_sertifikat": cert_no,
        "perusahaan": "PT Pupuk Kalimantan Timur",
        "lokasi_objek_aset": lokasi,
        "tanggal_pemeriksaan": to_iso_date(inspection_date_str),
        "tanggal_pemeriksaan_raw": inspection_date_str,
        "tanggal_terbit": to_iso_date(issue_date_str),
        "tanggal_terbit_raw": issue_date_str,
        "tanggal_expired": to_iso_date(expiry_date_str),
        "tanggal_expired_raw": expiry_date_str,
        "instansi_penerbit": "PT. Lentera Fokus Safetindo",
        "status_kelayakan": status_kelayakan,
    }
