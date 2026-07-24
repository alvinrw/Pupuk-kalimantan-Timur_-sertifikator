from fastapi import APIRouter, UploadFile, File, HTTPException
from app.ocr_engine.hybrid_extractor import extract_pdf_hybrid
from app.extractor.info_extractor import extract_permit_metadata
from app.matching.entity_matcher import match_entity

router = APIRouter()

@router.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    """
    Endpoint menerima file PDF:
    1. Direct PDF Text Extractor (jika PDF digital) / Fallback RapidOCR (jika scan gambar).
    2. NLP Rule Extraction (No Sertifikat, Tanggal Terbit, Expiry Date, Status).
    3. Mengembalikan JSON lengkap beserta metode ekstraksi yang digunakan.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File harus berformat PDF")
    
    content = await file.read()
    
    # 1. Hybrid Text Extraction
    full_text, method = extract_pdf_hybrid(content)
    
    # 2. Metadata Information Extraction
    metadata = extract_permit_metadata(full_text)
    metadata["file_name"] = file.filename
    metadata["extraction_method"] = method

    return {
        "statusCode": 200,
        "message": f"Berhasil memproses PDF ({method})",
        "data": metadata
    }
