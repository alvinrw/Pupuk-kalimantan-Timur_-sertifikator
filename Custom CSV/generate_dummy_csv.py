import csv
import random
import uuid
from datetime import datetime, timedelta

def random_date(start_year=2020, end_year=2028):
    start_dt = datetime(start_year, 1, 1)
    end_dt = datetime(end_year, 12, 31)
    delta = end_dt - start_dt
    rand_days = random.randrange(delta.days)
    return start_dt + timedelta(days=rand_days)

def generate_data():
    master_items = []
    certificates = []
    permits = []

    categories = ['perizinan-aset', 'perizinan-proyek', 'perizinan-produk', 'peralatan-pabrik']
    locations = ['Pabrik 1', 'Pabrik 2', 'Pabrik 3', 'Gudang Pusat', 'Unit Utilitas']
    jenis_sertifikat = ['SLF', 'AMDAL', 'Fire Alarm', 'Penyalur Petir', 'HGB']
    jenis_izin = ['Izin Lingkungan', 'Izin Usaha', 'Izin Operasional', 'Izin Genset']
    instansi_list = ['Dinas PUPR', 'DLH', 'Disnaker', 'BPN', 'Kementerian ESDM']

    # Generate 50 Master Items
    for i in range(1, 51):
        item_id = str(uuid.uuid4())
        terbit = random_date(2020, 2024)
        expired = terbit + timedelta(days=365 * random.randint(1, 5))
        
        master_items.append({
            'id': item_id,
            'code': f'PKT-AST-{i:03d}',
            'title': f'Aset Perusahaan Unit {i}',
            'categoryKey': random.choice(categories),
            'unitLocation': random.choice(locations),
            'status': random.choice(['Aktif', 'Aktif', 'Aktif', 'Non-Aktif']),
            'luasM2': str(random.randint(50, 5000)),
            'luasHa': str(round(random.uniform(0.1, 5.0), 2)),
            'peruntukan': 'Fasilitas Pabrik',
            'issueDate': terbit.strftime('%Y-%m-%d'),
            'expiryDate': expired.strftime('%Y-%m-%d'),
            'keterangan': f'Data Dummy {i}'
        })

        # Tiap Master Item kita kasih 1 Sertifikat & 1 Izin biar pas 50
        cert_terbit = random_date(2021, 2024)
        cert_expired = cert_terbit + timedelta(days=365)
        certificates.append({
            'itemId': item_id,
            'jenisSertifikat': random.choice(jenis_sertifikat),
            'noSertifikat': f'CERT/{cert_terbit.year}/{random.randint(1000, 9999)}',
            'instansi': random.choice(instansi_list),
            'terbit': cert_terbit.strftime('%Y-%m-%d'),
            'expired': cert_expired.strftime('%Y-%m-%d'),
            'status': random.choice(['Aktif', 'Aktif', 'Expired'])
        })

        permit_terbit = random_date(2021, 2024)
        permit_expired = permit_terbit + timedelta(days=365 * 3)
        permits.append({
            'itemId': item_id,
            'jenisIzin': random.choice(jenis_izin),
            'noIzin': f'IZIN/{permit_terbit.year}/{random.randint(100, 999)}',
            'instansi': random.choice(instansi_list),
            'terbit': permit_terbit.strftime('%Y-%m-%d'),
            'expired': permit_expired.strftime('%Y-%m-%d'),
            'status': 'Aktif',
            'keterangan': '-'
        })

    # Write Master Items CSV
    with open('master_items_dummy.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=master_items[0].keys())
        writer.writeheader()
        writer.writerows(master_items)

    # Write Certificates CSV
    with open('certificates_dummy.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=certificates[0].keys())
        writer.writeheader()
        writer.writerows(certificates)
        
    # Write Permits CSV
    with open('permits_dummy.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=permits[0].keys())
        writer.writeheader()
        writer.writerows(permits)

    print("Berhasil membuat 3 file CSV dengan masing-masing 50 baris data!")

if __name__ == '__main__':
    generate_data()
