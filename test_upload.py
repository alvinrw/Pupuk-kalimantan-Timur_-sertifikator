import requests
import json
import os

# URL API NestJS kita
url = "http://localhost:3000/api/v1/ocr/upload-scan"

# Ambil salah satu contoh file PDF dari folder Testing_ocr
pdf_path = r"C:\Users\alvin\Documents\Coolyeah\PKT\Inventor\Testing_ocr\Surat Keterangan\Fire Alarm System Gedung Arsip Teknik.pdf"

print(f"Mengirim file: {os.path.basename(pdf_path)}")
print(f"Menuju endpoint: {url}")
print("Tunggu sebentar, AI sedang membaca dokumen...")

try:
    with open(pdf_path, 'rb') as f:
        files = {'file': (os.path.basename(pdf_path), f, 'application/pdf')}
        response = requests.post(url, files=files)

    print("\n=== HASIL DARI NESTJS & FASTAPI ===")
    print(f"Status Code: {response.status_code}")
    
    try:
        # Tampilkan JSON dengan rapi
        parsed_json = response.json()
        print(json.dumps(parsed_json, indent=4, ensure_ascii=False))
    except:
        print(response.text)

except Exception as e:
    print(f"Error: {e}")
