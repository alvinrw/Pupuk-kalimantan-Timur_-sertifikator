import os
import pymupdf
from rapidocr_onnxruntime import RapidOCR

ocr_engine = RapidOCR()

def extract_pdf_hybrid(pdf_path_or_bytes) -> tuple[str, str, int]:
    """
    Hybrid PDF Extraction Pipeline dengan Page-Targeting:
    1. Memindai halaman PDF untuk menemukan halaman khusus yang ber-judul 'SERTIFIKAT'.
    2. Coba ekstraksi teks digital langsung (jika PDF digital).
    3. Fallback ke RapidOCR jika scanned image.
    
    Returns:
        tuple: (extracted_text, extraction_method, cert_page_number)
    """
    doc = None
    if isinstance(pdf_path_or_bytes, bytes):
        doc = pymupdf.open(stream=pdf_path_or_bytes, filetype="pdf")
    else:
        doc = pymupdf.open(pdf_path_or_bytes)

    target_page_idx = 0
    found_cert_page = False

    # -----------------------------------------------------------------
    # STEP 1: Scan Digital Text dulu untuk cari halaman SERTIFIKAT
    # -----------------------------------------------------------------
    for i, page in enumerate(doc):
        text = page.get_text()
        if "SERTIFIKAT" in text.upper():
            target_page_idx = i
            found_cert_page = True
            break

    # Jika teks digital ditemukan pada halaman sertifikat
    if found_cert_page and len(doc[target_page_idx].get_text().strip()) > 30:
        return doc[target_page_idx].get_text().strip(), "NATIVE_DIGITAL_PDF", target_page_idx + 1

    # -----------------------------------------------------------------
    # STEP 2: Jika scanned image, jalankan Fast OCR Page Scanner
    # -----------------------------------------------------------------
    cert_text = ""
    cert_page_num = 1

    for i in range(len(doc)):
        page = doc[i]
        pix = page.get_pixmap(dpi=150)
        temp_img = f"temp_scan_p{i+1}_{os.getpid()}.png"
        pix.save(temp_img)
        
        try:
            res, _ = ocr_engine(temp_img)
            if res:
                lines = [item[1].strip() for item in res]
                full_p = "\n".join(lines)
                if any("SERTIFIKAT" in l.upper() for l in lines):
                    cert_page_num = i + 1
                    cert_text = full_p
                    break
        finally:
            if os.path.exists(temp_img):
                os.remove(temp_img)

    # Fallback to page 1 if no explicit "SERTIFIKAT" header found
    if not cert_text:
        page = doc[0]
        pix = page.get_pixmap(dpi=200)
        temp_img = f"temp_scan_p1_{os.getpid()}.png"
        pix.save(temp_img)
        try:
            res, _ = ocr_engine(temp_img)
            cert_lines = [item[1].strip() for item in res] if res else []
            cert_text = "\n".join(cert_lines)
            cert_page_num = 1
        finally:
            if os.path.exists(temp_img):
                os.remove(temp_img)

    return cert_text, "AI_OCR_ENGINE", cert_page_num
