import requests

print("=== Alat Uji Coba Upload CSV ke NestJS ===")

# 1. URL Endpoint API kita
url = "http://localhost:3000/api/v1/csv-import/upload"

# 2. Lokasi file boongan yang tadi kita bikin
file_path = "Custom CSV/master_items_dummy.csv"

# 3. Kita tentukan tipe datanya (sesuai API yang kita bikin)
data = {
    "type": "master_items"
}

print(f"Mencoba mengirim {file_path} ke {url}...")

try:
    # 4. Buka file dan kirim menggunakan multipart/form-data
    with open(file_path, "rb") as file:
        files = {
            "file": ("master_items_dummy.csv", file, "text/csv")
        }
        
        response = requests.post(url, files=files, data=data)
        
        # 5. Cek hasilnya
        print("\n=== HASIL DARI SERVER ===")
        print("Status Code:", response.status_code)
        
        if response.status_code == 201 or response.status_code == 200:
            print("Pesan:", response.json())
            print("\nSUKSES BESAR! 🎉 CSV berhasil masuk ke Database!")
        else:
            print("Error:", response.text)
            
except FileNotFoundError:
    print(f"File {file_path} tidak ditemukan. Pastikan kamu menjalankan script ini dari folder Inventor.")
except requests.exceptions.ConnectionError:
    print("Server NestJS belum nyala! Jangan lupa jalankan 'npm run start:dev' dulu ya.")
