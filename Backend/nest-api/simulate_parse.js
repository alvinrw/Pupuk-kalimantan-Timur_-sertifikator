const fs = require('fs');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('C:\\Users\\alvin\\Documents\\Coolyeah\\PKT\\Inventor\\frontent\\public\\Template_perizinan Aset.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

const parsedRows = jsonData.filter(row => row.length > 0);
const headers = Array.from(parsedRows[0] || []).map(h => (h || '').toString().toLowerCase().replace(/[^a-z0-9]/g, ''));

const getVal = (cols, possibleNames) => {
  for (const name of possibleNames) {
    const idx = headers.findIndex(h => h && h.includes(name));
    if (idx !== -1 && cols[idx]) return String(cols[idx]).trim();
  }
  return '';
};

for (let i = 1; i < 4; i++) {
  const cols = parsedRows[i];
  if (!cols) continue;
  
  const title = getVal(cols, ['title', 'merekitem', 'merek', 'namaperalatan', 'namaproduk', 'judul', 'nama', 'namaaset']);
  const code = getVal(cols, ['code', 'registrasi', 'noslf', 'certificateno', 'nomorseri', 'noseriaset']);
  const noSertifikat = getVal(cols, ['nosertifikat', 'certificateno', 'noslf', 'nosurat']);
  
  console.log(`Row ${i}: title=${title}, code=${code}, noSertifikat=${noSertifikat}`);
}
