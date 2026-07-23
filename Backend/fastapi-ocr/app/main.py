from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.ocr_routes import router as ocr_router

app = FastAPI(
    title="Sertifikator AI OCR Service",
    description="FastAPI Microservice for PaddleOCR, PDF Extraction, NLP Metadata Extraction, and Entity Matching",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(ocr_router, prefix="/api/v1/ocr", tags=["OCR Engine"])

@app.get("/")
def health_check():
    return {
        "service": "Sertifikator FastAPI OCR Engine",
        "status": "online",
        "paddle_ocr": "ready"
    }
