import os
import sys
import re
import json
import fitz as pymupdf
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
    General Spatial Key-Value Certificate Extractor (RapidOCR + Proximity Engine):
    Mengekstrak 4 Field Utama berdasarkan tata letak spasial (Kanan & Bawah Label):
    1. Nomor Sertifikat / SKHP (nomor_sertifikat)
    2. Tanggal Inspeksi / Pengujian (tanggal_inspeksi)
    3. Tanggal Terbit (tanggal_terbit)
    4. Tanggal Berakhir / Pengujian Ulang (tanggal_berakhir)
    """
    doc = pymupdf.open(pdf_path)
    boxes_data = []

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
                page_boxes = []
                for item in res:
                    box = item[0]
                    text = item[1].strip()
                    score = item[2]
                    xs = [p[0] for p in box]
                    ys = [p[1] for p in box]
                    min_x, max_x = min(xs), max(xs)
                    min_y, max_y = min(ys), max(ys)
                    center_x = (min_x + max_x) / 2
                    center_y = (min_y + max_y) / 2

                    page_boxes.append({
                        'text': text,
                        'min_x': min_x, 'max_x': max_x,
                        'min_y': min_y, 'max_y': max_y,
                        'center_x': center_x, 'center_y': center_y,
                        'box': box, 'score': score
                    })

                lines = [b['text'] for b in page_boxes]
                if any(kw in l.upper() for l in lines for kw in ["SERTIFIKAT", "HASIL PENGUJIAN", "SURAT KETERANGAN"]):
                    target_page_idx = i
                    boxes_data = page_boxes
                    break
                elif not boxes_data:
                    boxes_data = page_boxes
        finally:
            if os.path.exists(temp_img):
                os.remove(temp_img)

    # ----------------------------------------------------
    # 1. SPATIAL CERTIFICATE NUMBER EXTRACTION
    # ----------------------------------------------------
    raw_cert_no = "UNKNOWN"
    label_box = None

    # Step 1A: Search for explicit label box
    for b in boxes_data:
        text_lower = b['text'].lower()
        if any(kw in text_lower for kw in ["nomor", "no.", "no:", "no "]) and not any(bad in text_lower for bad in ["telp", "fax", "website", "email", "@", "pos-el", "halaman", "page"]):
            label_box = b
            # Check if value is inline inside the same box
            if ":" in b['text'] and len(b['text'].split(":", 1)) > 1 and len(b['text'].split(":", 1)[1].strip()) > 2:
                raw_cert_no = b['text'].split(":", 1)[1].strip()
                break
            elif "：" in b['text'] and len(b['text'].split("：", 1)) > 1 and len(b['text'].split("：", 1)[1].strip()) > 2:
                raw_cert_no = b['text'].split("：", 1)[1].strip()
                break

    # Step 1B: Spatial Search (Right or Below of label_box)
    if raw_cert_no == "UNKNOWN" and label_box:
        # Search Right
        right_candidates = [
            b for b in boxes_data
            if b['min_x'] >= label_box['max_x'] - 15
            and abs(b['center_y'] - label_box['center_y']) < 35
            and len(b['text']) > 2
        ]
        if right_candidates:
            right_candidates.sort(key=lambda b: b['min_x'])
            raw_cert_no = right_candidates[0]['text']
        else:
            # Search Below
            below_candidates = [
                b for b in boxes_data
                if b['min_y'] >= label_box['max_y'] - 5
                and b['min_y'] <= label_box['max_y'] + 50
                and abs(b['center_x'] - label_box['center_x']) < 200
                and len(b['text']) > 2
            ]
            if below_candidates:
                below_candidates.sort(key=lambda b: b['min_y'])
                raw_cert_no = below_candidates[0]['text']

    # Step 1C: Fallback regex scan over all lines if spatial search missed
    if raw_cert_no == "UNKNOWN":
        for b in boxes_data:
            m = re.search(r'([0-9]{3,}[\.\/][A-Za-z0-9\.\/A-Za-z\-\s]{4,})', b['text'])
            if m and not any(bad in b['text'].lower() for bad in ["telp", "fax", "website", "jl.", "jalan"]):
                raw_cert_no = m.group(1).strip()
                break

    nomor_sertifikat_clean = clean_certificate_number(raw_cert_no)

    # ----------------------------------------------------
    # 2. SPATIAL DATES EXTRACTION (INSPEKSI, TERBIT, BERAKHIR)
    # ----------------------------------------------------
    inspection_date_str = None
    expiry_date_str = None
    issue_date_str = None

    # Gather all boxes that contain date strings
    date_boxes = []
    for b in boxes_data:
        fixed_text = re.sub(r'(\d)[oO]\b', r'\g<1>0', b['text'])
        m = re.search(r'([0-9]{1,2}\s*(?:dan\s*[0-9]{1,2}\s*)?[A-Za-z]+\s*[0-9]{4}|[0-9]{4}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{1,2}|[0-9]{1,2}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{4})', fixed_text)
        if m:
            date_boxes.append({
                'box': b,
                'date_str': m.group(1).strip()
            })

    for db in date_boxes:
        b = db['box']
        d_str = db['date_str']

        # Find nearest label box to the left or above
        left_labels = [
            lb['text'].lower().replace(" ", "") for lb in boxes_data
            if lb['max_x'] <= b['min_x'] + 20 and abs(lb['center_y'] - b['center_y']) < 35
        ]
        above_labels = [
            lb['text'].lower().replace(" ", "") for lb in boxes_data
            if lb['max_y'] <= b['min_y'] + 10 and b['min_y'] - lb['max_y'] < 60 and abs(lb['center_x'] - b['center_x']) < 250
        ]
        all_nearby_labels = left_labels + above_labels

        text_context = b['text'].lower().replace(" ", "") + " " + " ".join(all_nearby_labels)

        # Classify Date
        if any(kw in text_context for kw in ["berikutnya", "masaberlaku", "s/d", "s.d.", "palinglambat", "pengujianulang", "ujiulang", "hingga"]):
            if not expiry_date_str:
                expiry_date_str = d_str
        elif any(kw in text_context for kw in ["pemeriksaan", "inspeksi", "pada", "datapengujian", "pengujian"]) and not any(bad in text_context for bad in ["berikutnya", "ulang"]):
            if not inspection_date_str:
                inspection_date_str = d_str
        elif any(kw in text_context for kw in ["bontang", "samarinda", "jakarta", "balikpapan", "terbit", "diterbitkan"]):
            if not issue_date_str:
                issue_date_str = d_str
        elif not issue_date_str:
            issue_date_str = d_str

    # Convert to standard ISO dates
    tgl_inspeksi_iso = to_iso(inspection_date_str)
    tgl_terbit_iso = to_iso(issue_date_str)
    tgl_berakhir_iso = to_iso(expiry_date_str)

    # Auto calculate expiry (+1 year) if not explicitly present
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
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        pdf_target = sys.argv[1]
        res = extract_certificate_general(pdf_target)
        print("JSON_START")
        print(json.dumps(res, ensure_ascii=False))
        print("JSON_END")
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        pdf_target = None
        for root, dirs, files in os.walk(script_dir):
            for f in files:
                if f.endswith(".pdf"):
                    pdf_target = os.path.join(root, f)
                    break
            if pdf_target: break

        if pdf_target and os.path.exists(pdf_target):
            res = extract_certificate_general(pdf_target)
            print(json.dumps(res, ensure_ascii=False))
