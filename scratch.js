async function test() {
  try {
    const payload = {
      nomer: '',
      kompartemen: 'Sekretaris Perusahaan',
      unitKerja: 'Dept. Administrasi Korporat',
      asosiasi: 'Asosiasi Pengusaha Pupuk Indonesia (APPI)',
      periode: '2026 - 2027',
      nominal: 800000000,
      status: 'Perusahaan',
      statusPembayaran: 'Belum Lunas',
      nama: 'PT Pupuk Kalimantan Timur',
      npk: '',
      keterangan: '-'
    };
    const res = await fetch('http://localhost:3005/api/v1/iuran-keanggotaan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
