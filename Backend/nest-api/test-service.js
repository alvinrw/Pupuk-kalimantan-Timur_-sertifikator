const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./src/app.module');
const { CsvImportService } = require('./src/modules/csv-import/csv-import.service');
const xlsx = require('xlsx');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const csvImportService = app.get(CsvImportService);

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

  console.log(`Payload length: ${groupedData.length}`);
  
  const result = await csvImportService.processBulkNested(groupedData, 'perizinan-aset', 'Template_perizinan Aset.xlsx');
  console.log("Result:", result);
  
  await app.close();
}

bootstrap().catch(console.error);
