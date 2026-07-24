from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from app.extractors.fire_alarm import extract_fire_alarm_cert

router = APIRouter()

@router.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    """
    Endpoint menerima file PDF:
    Saat ini mengarahkan semua file ke Extractor Fire Alarm.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File harus berformat PDF")
    
    # Save uploaded file to a temporary location
    temp_filename = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Eksekusi AI OCR
        result = extract_fire_alarm_cert(temp_filename, file.filename)
        
        return {
            "statusCode": 200,
            "message": "Berhasil memproses PDF dengan AI (Fire Alarm Extractor)",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

