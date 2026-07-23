import os
import re
import json
import pymupdf
import cv2
import numpy as np
from datetime import datetime
from rapidocr_onnxruntime import RapidOCR

ocr_engine = RapidOCR()

MONTH_MAP = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
    'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
    'september': '09', 'oktober': '10', 'november': '11', 'desember': '12',
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05',
    'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10',
    'nov': '11', 'dec': '12'
}

def to_iso(d_str):
    if not d_str: return None
    clean = re.sub(r'(\d)[oO]\b', r'\g<1>0', str(d_str))
    clean = re.sub(r'\bO(?=\d)', '0', clean)
    m = re.search(r'([0-9]{1,2})\s*([A-Za-z]+)\s*([0-9]{4})', clean)
    if m:
        day = m.group(1).zfill(2)
        if int(day) > 31: return None
        month = MONTH_MAP.get(m.group(2).lower(), '01')
        year = m.group(3)
        return f"{year}-{month}-{day}"
    return None

def add_one_year_iso(iso_str):
    if not iso_str: return None
    try:
        dt = datetime.strptime(iso_str, "%Y-%m-%d")
        exp_dt = dt.replace(year=dt.year + 1)
        return exp_dt.strftime("%Y-%m-%d")
    except Exception:
        return None

def preprocess_image_ocr(pix_map):
    img_np = np.frombuffer(pix_map.samples, dtype=np.uint8).reshape((pix_map.height, pix_map.width, pix_map.n))
    if pix_map.n == 4:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
    elif pix_map.n == 3:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
    enhanced = cv2.addWeighted(gray, 1.5, cv2.GaussianBlur(gray, (0,0), 3), -0.5, 0)
    return enhanced

def clean_certificate_number(raw_no: str) -> str:
    if not raw_no or raw_no.upper() == "UNKNOWN":
        return "UNKNOWN"

    raw_no = raw_no.replace("：", "").replace(":", "").strip()
    parts = [p.strip() for p in raw_no.split('/')]
    cleaned_parts = []

    for idx, p in enumerate(parts):
        if idx == 1:
            fixed_p = re.sub(r'^S(?=\d)', '5', p, flags=re.IGNORECASE)
            fixed_p = re.sub(r'O', '0', fixed_p)
            cleaned_parts.append(fixed_p.replace(" ", ""))
        elif idx == len(parts) - 1:
            fixed_p = re.sub(r'DTKT\s*-\s*[1lI]{3}', 'DTKT - III', p, flags=re.IGNORECASE)
            fixed_p = re.sub(r'DTKT\s*-\s*[1lI]{2}', 'DTKT - II', fixed_p, flags=re.IGNORECASE)
            fixed_p = re.sub(r'DTKT\s*-\s*[1lI]{1}', 'DTKT - I', fixed_p, flags=re.IGNORECASE)
            cleaned_parts.append(fixed_p)
        else:
            cleaned_parts.append(p)

    return " / ".join(cleaned_parts)

def extract_certificate_general(pdf_path: str) -> dict:
    """
    General Certificate Extractor Universal:
    Mengekstrak 4 Field Utama Sesuai Kebutuhan Pengguna:
    1. Nomor Sertifikat / SKHP (nomor_sertifikat)
    2. Tanggal Inspeksi / Pengujian (tanggal_inspeksi)
    3. Tanggal Terbit (tanggal_terbit)
    4. Tanggal Berakhir / Pengujian Ulang (tanggal_berakhir)
    """
    doc = pymupdf.open(pdf_path)
    cert_lines = []

    target_page_idx = 0
    for i in range(len(doc)):
        page = doc[i]
        pix = page.get_pixmap(dpi=250)
        img_prep = preprocess_image_ocr(pix)
        temp_img = f"temp_prep_{os.getpid()}.png"
        cv2.imwrite(temp_img, img_prep)

        try:
            res, _ = ocr_engine(temp_img)
            if res:
                lines = [item[1].strip() for item in res]
                if any(kw in l.upper() for l in lines for kw in ["SERTIFIKAT", "HASIL PENGUJIAN", "SURAT KETERANGAN"]):
                    target_page_idx = i
                    cert_lines = lines
                    break
        finally:
            if os.path.exists(temp_img):
                os.remove(temp_img)

    if not cert_lines:
        page = doc[0]
        pix = page.get_pixmap(dpi=250)
        img_prep = preprocess_image_ocr(pix)
        temp_img = f"temp_prep_{os.getpid()}.png"
        cv2.imwrite(temp_img, img_prep)
        try:
            res, _ = ocr_engine(temp_img)
            cert_lines = [item[1].strip() for item in res] if res else []
        finally:
            if os.path.exists(temp_img):
                os.remove(temp_img)

    # 1. NOMOR SERTIFIKAT / DOKUMEN / SKHP / SUKET
    raw_cert_no = "UNKNOWN"
    for i, l in enumerate(cert_lines):
        clean_kw_line = l.lower().replace(" ", "").replace(".", "")
        if any(l.lower().startswith(prefix) for prefix in ["nomor", "no.", "no:", "no "]) or "nomor:" in clean_kw_line or "no:" in clean_kw_line:
            if not any(bad in l.lower() for bad in ["telp", "fax", "website", "email", "@", "pos-el"]):
                if ":" in l and len(l.split(":", 1)) > 1 and l.split(":", 1)[1].strip():
                    raw_cert_no = l.split(":", 1)[1].strip()
                    break
                elif "：" in l and len(l.split("：", 1)) > 1 and l.split("：" , 1)[1].strip():
                    raw_cert_no = l.split("：", 1)[1].strip()
                    break
                elif i + 1 < len(cert_lines) and ("/" in cert_lines[i+1] or "-" in cert_lines[i+1]):
                    raw_cert_no = cert_lines[i+1].replace(":", "").replace("：", "").strip()
                    if raw_cert_no:
                        break

    nomor_sertifikat_clean = clean_certificate_number(raw_cert_no)

    # 2. TANGGAL-TANGGAL (INSPEKSI, TERBIT, BERAKHIR)
    inspection_date_str = None
    expiry_date_str = None
    issue_date_str = None

    for i, l in enumerate(cert_lines):
        clean_l = l.replace(" ", "").lower()
        l_fixed = re.sub(r'(\d)[oO]\b', r'\g<1>0', l)

        # A. Tanggal Expired / Berakhir / Pengujian Ulang
        if any(kw in clean_l for kw in ["berikutnya", "masaberlaku", "s/d", "s.d.", "palinglambat", "pengujianulang", "ujiulang"]):
            m = re.search(r'([0-9]{1,2}\s*[A-Za-z]+\s*[0-9]{4})', l_fixed)
            if not m and i + 1 < len(cert_lines):
                m = re.search(r'([0-9]{1,2}\s*[A-Za-z]+\s*[0-9]{4})', cert_lines[i+1])
            if m:
                expiry_date_str = m.group(1).strip()

        # B. Tanggal Inspeksi / Pemeriksaan Fisik / Tanggal Pengujian
        elif any(kw in clean_l for kw in ["tanggalpemeriksaan", "pada", "inspeksi", "pemeriksaan", "datapengujian", "tanggal"]) and not any(bad in clean_l for bad in ["berikutnya", "ulang", "sk", "peraturan", "uu"]):
            m = re.search(r'([0-9]{1,2}\s*(?:dan\s*[0-9]{1,2}\s*)?[A-Za-z]+\s*[0-9]{4})', l_fixed)
            if not m and i + 1 < len(cert_lines):
                m = re.search(r'([0-9]{1,2}\s*(?:dan\s*[0-9]{1,2}\s*)?[A-Za-z]+\s*[0-9]{4})', cert_lines[i+1])
            if m:
                inspection_date_str = m.group(1).strip()

        # C. Tanggal Terbit (Samarinda/Bontang/Jakarta, DD Month YYYY)
        if any(city in clean_l for city in ["bontang", "samarinda", "jakarta", "balikpapan"]):
            if not any(kw in clean_l for kw in ["prov", "jalan", "provinsi", "kota", "utara", "selatan", "website", "fax", "pos-el", "email"]):
                m = re.search(r'([0-9]{1,2}\s*[A-Za-z]+\s*[0-9]{4})', l_fixed)
                if m:
                    issue_date_str = m.group(1).strip()

    # Convert to standard ISO dates
    tgl_inspeksi_iso = to_iso(inspection_date_str)
    tgl_terbit_iso = to_iso(issue_date_str)
    tgl_berakhir_iso = to_iso(expiry_date_str)

    # Jika Tanggal Berakhir tidak tertulis eksplisit di dokumen (misal Fire Alarm), otomatis +1 Tahun dari Tanggal Terbit
    if not tgl_berakhir_iso and tgl_terbit_iso:
        tgl_berakhir_iso = add_one_year_iso(tgl_terbit_iso)

    result = {
        "file_name": os.path.basename(pdf_path),
        "nomor_sertifikat": nomor_sertifikat_clean,
        "tanggal_inspeksi": tgl_inspeksi_iso,
        "tanggal_inspeksi_raw": inspection_date_str,
        "tanggal_terbit": tgl_terbit_iso,
        "tanggal_terbit_raw": issue_date_str,
        "tanggal_berakhir": tgl_berakhir_iso,
        "tanggal_berakhir_raw": expiry_date_str
    }

    # Simpan hasil ke file JSON
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_json = os.path.join(script_dir, "cert_page_only_result.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    return result

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    pdf_target = None
    for root, dirs, files in os.walk(script_dir):
        for f in files:
            if "Timbangan" in root or "SKHP" in f:
                if f.endswith(".pdf"):
                    pdf_target = os.path.join(root, f)
                    break
        if pdf_target: break

    if not pdf_target:
        for root, dirs, files in os.walk(script_dir):
            for f in files:
                if f.endswith(".pdf"):
                    pdf_target = os.path.join(root, f)
                    break
            if pdf_target: break

    if pdf_target and os.path.exists(pdf_target):
        res = extract_certificate_general(pdf_target)
        print("==================================================")
        print(f"HASIL EKSTRAKSI GENERAL UTAMA ({os.path.basename(pdf_target)}):")
        print("==================================================")
        print(f"File Hasil JSON: {os.path.join(script_dir, 'cert_page_only_result.json')}")
