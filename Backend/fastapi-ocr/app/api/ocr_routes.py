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

import zipfile
@router.post("/process-zip")
async def process_zip(file: UploadFile = File(...)):
    """
    Endpoint menerima file ZIP berisi banyak PDF dan mengekstrak datanya.
    """
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="File harus berformat ZIP")
    
    temp_zip = f"temp_{uuid.uuid4().hex}_{file.filename}"
    extract_dir = f"temp_dir_{uuid.uuid4().hex}"
    
    with open(temp_zip, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    results = []
    
    try:
        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
            
        for root, _, files in os.walk(extract_dir):
            for filename in files:
                if filename.endswith(".pdf"):
                    pdf_path = os.path.join(root, filename)
                    try:
                        # Process each PDF using AI OCR
                        res = extract_fire_alarm_cert(pdf_path, filename)
                        results.append({
                            "pdfName": filename,
                            "data": res
                        })
                    except Exception as e:
                        print(f"Error processing {filename}: {e}")
                        results.append({
                            "pdfName": filename,
                            "error": str(e)
                        })
        return {
            "statusCode": 200,
            "message": f"Berhasil mengekstrak {len(results)} file dari ZIP",
            "data": results
        }
    finally:
        if os.path.exists(temp_zip):
            os.remove(temp_zip)
        shutil.rmtree(extract_dir, ignore_errors=True)
