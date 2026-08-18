const fs = require('fs');
const xlsx = require('xlsx');

function testExtract() {
  const workbook = xlsx.readFile('C:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/public/Template_perizinan Aset.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
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
    
    groupedData.push({
      master: { title, code },
      certificates: (noSertifikat && noSertifikat !== '-' && noSertifikat.toLowerCase() !== 'tanpa sertifikat')
        ? [{ noSertifikat }]
        : []
    });
  }
  
  console.log(JSON.stringify(groupedData.slice(0, 3), null, 2));
}

testExtract();
