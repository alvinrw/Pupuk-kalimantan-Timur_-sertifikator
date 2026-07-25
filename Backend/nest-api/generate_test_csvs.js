const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const types = [
  { key: 'peralatan-pabrik', prefix: 'EQ' },
  { key: 'perizinan-aset', prefix: 'AST' },
  { key: 'perizinan-proyek', prefix: 'PRJ' },
  { key: 'sertifikat-ciptaan', prefix: 'CRT' },
  { key: 'administrasi-lainnya', prefix: 'ADM' }
];

const csvDir = path.join(__dirname, '..', '..', 'Custom CSV', 'Test Scenarios');
if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}

async function run() {
  for (const type of types) {
    const headers = "id,code,title,categoryKey,unitLocation,status,luasM2,luasHa,peruntukan,issueDate,expiryDate,keterangan\n";
    let csvData = headers;
    
    // We will create 15 rows.
    // 1-3: Will be seeded (Duplicates)
    // 4-12: New successful records
    // 13-15: Fails (Title has ERROR)
    
    const seededRows = [];
    
    for (let i = 1; i <= 15; i++) {
      const id = `${type.prefix}-TEST-${i}`;
      const code = `CODE-${type.prefix}-${i}`;
      let title = `Testing Item ${type.prefix} ${i}`;
      
      if (i >= 13) {
        title = `Testing Item ${type.prefix} ${i} (ERROR) - Akan Gagal`;
      }
      
      const rowStr = `${id},${code},${title},${type.key},Pabrik Uji,Aktif,,,Uji Coba,2026-01-01,2030-01-01,File Testing\n`;
      csvData += rowStr;
      
      if (i <= 3) {
        seededRows.push({
          id,
          code,
          title,
          categoryKey: type.key,
          unitLocation: 'Pabrik Uji',
          status: 'Aktif'
        });
      }
    }
    
    // Write CSV
    fs.writeFileSync(path.join(csvDir, `test_15_${type.key}.csv`), csvData);
    
    // Seed DB
    for (const row of seededRows) {
      await prisma.masterItem.upsert({
        where: { id: row.id },
        update: {},
        create: row
      });
    }
  }
  
  console.log("CSV files and seed data generated successfully.");
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
