const axios = require('axios');
const xlsx = require('xlsx');

async function testUpload() {
  const workbook = xlsx.readFile('C:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/public/Template_perizinan Aset.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonArray = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  const parsedRows = jsonArray.filter(row => row.length > 0);
  const headers = Array.from(parsedRows[0] || []).map(h => (h || '').toString().toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  const getVal = (cols, possibleNames) => {
    for (const name of possibleNames) {
      const idx = headers.findIndex(h => h && h.includes(name));
      if (idx !== -1 && cols[idx]) return String(cols[idx]).trim();
    }
    return '';
  };

  const groupedData = [];
  for (let i = 1; i < parsedRows.length; i++) {
    const cols = parsedRows[i];
    if (!cols || cols.length < 2) continue;
    
    const title = getVal(cols, ['title', 'merekitem', 'merek', 'namaperalatan', 'namaproduk', 'judul', 'nama', 'namaaset']);
    const code = getVal(cols, ['code', 'registrasi', 'noslf', 'certificateno', 'nomorseri', 'noseriaset']);
    const noSertifikat = getVal(cols, ['nosertifikat', 'certificateno', 'noslf', 'nosurat']);
    const tipe = getVal(cols, ['jenis', 'tipe', 'peruntukan', 'jenisaset']);
    const unitLocation = getVal(cols, ['unit', 'lokasi', 'lokasiaset']);
    const penanggungJawab = getVal(cols, ['user', 'kontraktor', 'pencipta', 'penanggungjawab']);
    const status = getVal(cols, ['status', 'kondisi', 'statusaset']);
    const namaSertifikat = getVal(cols, ['namasertifikat', 'jenissertifikat']) || tipe || 'Sertifikat Utama';
    
    groupedData.push({
      master: { title, tipe, code, unitLocation, penanggungJawab, status },
      certificates: (noSertifikat && noSertifikat !== '-' && noSertifikat.toLowerCase() !== 'tanpa sertifikat')
        ? [{ namaSertifikat, noSertifikat }]
        : []
    });
  }
  
  console.log(`Sending ${groupedData.length} rows to API...`);
  try {
    const res = await axios.post('http://localhost:3000/api/v1/csv-import/bulk-nested', {
      data: groupedData,
      categoryKey: 'perizinan-aset',
      fileName: 'Template_perizinan Aset.xlsx'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log("Response:", res.data);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}
testUpload();
