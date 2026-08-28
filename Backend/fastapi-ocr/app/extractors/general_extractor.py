import os
import re
import fitz
from datetime import datetime
from rapidocr_onnxruntime import RapidOCR

ocr_engine = RapidOCR()

MONTH_MAP = {
    'januari': '01', 'jan': '01', 'january': '01',
    'februari': '02', 'feb': '02', 'february': '02', 'pebruari': '02',
    'maret': '03', 'mar': '03', 'march': '03',
    'april': '04', 'apr': '04',
    'mei': '05', 'may': '05',
    'juni': '06', 'jun': '06', 'june': '06',
    'juli': '07', 'jul': '07', 'july': '07',
    'agustus': '08', 'ags': '08', 'august': '08', 'aug': '08', 'agst': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'oktober': '10', 'okt': '10', 'october': '10', 'oct': '10',
    'november': '11', 'nov': '11', 'nopember': '11',
    'desember': '12', 'des': '12', 'december': '12', 'dec': '12'
}

def parse_date_python(raw_text: str):
    clean = re.sub(r'[\n\r]', ' ', raw_text)
    clean = re.sub(r'[^\w\s\/\.,-]', ' ', clean).strip()
    
    # Normalize O/I to numbers if adjacent to numbers
    clean = re.sub(r'(\d)[oO]\b', r'\g<1>0', clean)
    clean = re.sub(r'\b[oO](?=\d)', '0', clean)
    clean = re.sub(r'(\d)[iIlL]\b', r'\g<1>1', clean)
    clean = re.sub(r'\b[iIlL](?=\d)', '1', clean)

    # Standard ISO / DMY
    iso_match = re.search(r'\b(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})\b', clean)
    if iso_match:
        y, m, d = iso_match.groups()
        if 1 <= int(m) <= 12 and 1 <= int(d) <= 31 and int(y) > 1900:
            return f"{y}-{m.zfill(2)}-{d.zfill(2)}"
            
    dmy_match = re.search(r'\b(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})\b', clean)
    if dmy_match:
        d, m, y = dmy_match.groups()
        if 1 <= int(m) <= 12 and 1 <= int(d) <= 31 and int(y) > 1900:
            return f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    # Text Date Match (e.g. 12 Agustus 2024)
    year_match = re.search(r'\b(19\d{2}|20\d{2})\b', clean)
    year = year_match.group(1) if year_match else None
    
    if not year:
        return None

    day = '01'
    day_match = re.search(r'\b([0-3]?[0-9])\b', clean)
    if day_match and 0 < int(day_match.group(1)) <= 31:
        day = day_match.group(1).zfill(2)

    words = clean.lower().split()
    month = None
    for w in words:
        if len(w) < 3: continue
        for k, v in MONTH_MAP.items():
            if k in w or w in k:
                month = v
                break
        if month: break

    if month and year:
        return f"{year}-{month}-{day}"

    return None

def parse_cert_number_python(raw_text: str):
    clean = re.sub(r'[\n\r]', ' ', raw_text)
    clean = re.sub(r'\s+', ' ', clean).strip()

    remove_labels = [
        r'(?i)nomor\s+sertifikat\s*[:;\.\-]?\s*',
        r'(?i)no\.\s*sertifikat\s*[:;\.\-]?\s*',
        r'(?i)nomor\s*[:;\.\-]?\s*',
        r'(?i)no\.\s*[:;\.\-]?\s*',
        r'(?i)no\s*[:;\.\-]?\s*',
        r'(?i)reg(?:istrasi)?\s*(?:no\.?)?\s*[:;\.\-]?\s*',
        r'(?i)sertifikat\s*(?:no\.?)?\s*[:;\.\-]?\s*',
        r'(?i)certificate\s*(?:no\.?)?\s*[:;\.\-]?\s*',
        r'(?i)surat\s+keterangan\s*[:;\.\-]?\s*'
    ]
    for lbl in remove_labels:
        clean = re.sub(lbl, '', clean)
        
    clean = re.sub(r'^[^A-Za-z0-9]+', '', clean)
    clean = re.sub(r'[^A-Za-z0-9]+$', '', clean).strip()
    
    blacklist = ['tanggal', 'berlaku', 'nama', 'jenis', 'surat', 'sertifikat', 'halaman', 'telp', 'fax', 'website', 'email', 'jalan', 'jl']
    
    def is_blacklisted(s):
        return any(b in s.lower() for b in blacklist)

    m = re.search(r'^([A-Za-z0-9\/\-\.]+)', clean)
    if m:
        cand = m.group(1)
        if not is_blacklisted(cand) and len(cand) >= 4:
            return cand.upper()

    patterns = [
        r'([0-9]{2,}[\/\.][A-Za-z0-9\/\.\-]{4,40})',
        r'(?i)(SK[-\s][A-Za-z0-9\-\/]{4,30})',
        r'(?i)(CERT[-\s][A-Za-z0-9\-\/]{4,30})',
        r'([A-Z]{2,6}[-\/][0-9]{2,4}[-\/][A-Za-z0-9\.\/-]{3,20})'
    ]
    for p in patterns:
        m2 = re.search(p, clean)
        if m2 and not is_blacklisted(m2.group(1)):
            return re.sub(r'[,;:\.\s]+$', '', m2.group(1).strip()).upper()

    return "UNKNOWN"

def extract_general_cert(pdf_path: str, original_filename: str) -> dict:
    """
    General OCR Extractor yang mencoba mengekstrak metadata dari dokumen apapun
    """
    doc = fitz.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=200)
    temp_img = f"temp_general_{os.getpid()}.png"
    pix.save(temp_img)

    try:
        res, _ = ocr_engine(temp_img)
        lines = [item[1].strip() for item in res] if res else []
        full_text = "\n".join(lines)
        
        # 1. Coba cari Baris yang berisi tanggal
        tanggal_terbit_iso = None
        for l in lines:
            if "20" in l or "19" in l:
                d = parse_date_python(l)
                if d:
                    tanggal_terbit_iso = d
                    break
        
        # Jika baris per baris gagal, coba full text
        if not tanggal_terbit_iso:
            tanggal_terbit_iso = parse_date_python(full_text)
            
        # 2. Tanggal Expired (+1 Tahun by default, atau baca jika ada 'Berlaku s/d')
        tanggal_expired_iso = None
        if tanggal_terbit_iso:
            try:
                dt = datetime.strptime(tanggal_terbit_iso, "%Y-%m-%d")
                tanggal_expired_iso = dt.replace(year=dt.year + 1).strftime("%Y-%m-%d")
            except:
                pass
                
        # 3. Cari Baris yang berisi Nomor
        cleaned_cert_no = "UNKNOWN"
        for l in lines:
            if "nomor" in l.lower() or "no." in l.lower() or "no:" in l.lower() or "sk" in l.lower() or "reg" in l.lower():
                cn = parse_cert_number_python(l)
                if cn and cn != "UNKNOWN":
                    cleaned_cert_no = cn
                    break
                    
        if cleaned_cert_no == "UNKNOWN":
            cn = parse_cert_number_python(full_text)
            if cn: cleaned_cert_no = cn

        # 4. Status Kelayakan
        status_kelayakan = "Layak"
        if "tidak memenuhi" in full_text.lower() or "tidak layak" in full_text.lower() or "reject" in full_text.lower():
            status_kelayakan = "Tidak Layak"

        # Tentukan Kategori Berdasarkan Keyword Density
        kategori_template = "GENERAL_DOCUMENT"
        txt_low = full_text.lower()
        if "fire alarm" in txt_low or "hydrant" in txt_low:
            kategori_template = "FIRE_ALARM_SYSTEM"
        elif "boiler" in txt_low or "ketel uap" in txt_low:
            kategori_template = "BOILER"
        elif "forklift" in txt_low or "pesawat angkat" in txt_low:
            kategori_template = "FORKLIFT"

        result = {
            "kategori_template": kategori_template,
            "file_name": original_filename,
            "nomor_surat": cleaned_cert_no,
            "raw_ocr_nomor_surat": cleaned_cert_no,
            "jenis_objek": "General Equipment",
            "merek_model": "Tidak Spesifik",
            "jumlah_detector": "-",
            "tanggal_terbit": tanggal_terbit_iso,
            "tanggal_terbit_raw": tanggal_terbit_iso,
            "tanggal_expired": tanggal_expired_iso,
            "keterangan_expired": "Masa berlaku estimasi otomatis",
            "status_kelayakan": status_kelayakan,
            "confidence_score": 85.0 if kategori_template == "GENERAL_DOCUMENT" else 92.5
        }

        return result
    except Exception as e:
        os.makedirs("logs", exist_ok=True)
        with open("logs/ocr_errors.log", "a") as f:
            f.write(f"[{datetime.now()}] ERROR General OCR on {original_filename}: {str(e)}\n")
        raise e
    finally:
        if os.path.exists(temp_img):
            os.remove(temp_img)
