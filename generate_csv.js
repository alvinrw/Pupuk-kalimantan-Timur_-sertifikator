const fs = require('fs');
let csv = 'Nama Aset / Master (Wajib),Jenis Kategori,Kode / No Seri,Lokasi Unit,Penanggung Jawab,Status Aset,Nama Sertifikat (Child),No Sertifikat Active,Tgl Terbit,Tgl Expired\n';

for (let i = 1; i <= 10; i++) {
  const nStr = i.toString().padStart(3,'0');
  csv += `Overhead Crane ${i} Ton,Aset Peralatan,CR-${nStr},Bay ${i},Dept Pemeliharaan,Aktif,Sertifikat Layak Operasi,SLO-CR${nStr},2025-01-01,2026-01-01\n`;
  csv += `Overhead Crane ${i} Ton,Aset Peralatan,CR-${nStr},Bay ${i},Dept Pemeliharaan,Aktif,Sertifikat K3,K3-CR${nStr},2025-06-01,2026-06-01\n`;
}

for (let i = 1; i <= 10; i++) {
  const nStr = i.toString().padStart(3,'0');
  csv += `Forklift ${i} Ton,Aset Kendaraan,FL-${nStr},Gudang ${i},Dept Logistik,Aktif,Sertifikat Layak Operasi,SLO-FL${nStr},2025-02-01,2026-02-01\n`;
  csv += `Forklift ${i} Ton,Aset Kendaraan,FL-${nStr},Gudang ${i},Dept Logistik,Aktif,Sertifikat K3,K3-FL${nStr},2025-07-01,2026-07-01\n`;
}

for (let i = 1; i <= 10; i++) {
  const nStr = i.toString().padStart(3,'0');
  csv += `Kompresor Nitrogen ${i},Mesin Produksi,KP-${nStr},Pabrik ${i},Dept Produksi,Aktif,Sertifikat Tekanan Tinggi,STT-KP${nStr},2025-03-01,2026-03-01\n`;
  csv += `Kompresor Nitrogen ${i},Mesin Produksi,KP-${nStr},Pabrik ${i},Dept Produksi,Aktif,Sertifikat K3,K3-KP${nStr},2025-08-01,2026-08-01\n`;
}

fs.writeFileSync('C:/Users/alvin/Documents/Coolyeah/PKT/Inventor/Custom CSV/dummy_60_rows.csv', csv);
console.log('Done generating CSV');
