import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding data Iuran Keanggotaan...');

  // Delete all existing to avoid duplication since we don't have unique keys other than ID
  await prisma.iuranKeanggotaan.deleteMany({});
  console.log('Tabel iuran_keanggotaan telah dikosongkan.');

  const tsvPath = 'c:\\Users\\alvin\\.gemini\\antigravity-ide\\brain\\955a48fc-8871-41a2-bfc1-4e7a7b08ad0e\\scratch\\input.tsv';
  const tsv = fs.readFileSync(tsvPath, 'utf-8');
  const lines = tsv.split('\n').map(l => l.trim()).filter(l => l);

  let startIdx = 0;
  while (startIdx < lines.length && (lines[startIdx].startsWith('Pilihan') || lines[startIdx].startsWith('No\t') || !lines[startIdx])) {
    startIdx++;
  }

  const dataToInsert = [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (line === 'input in') break;
    
    const cols = line.split('\t');
    
    let cIndex = 0;
    let nomer = '';
    if (cols[0] && cols[0].trim().match(/^\d+$/)) {
      nomer = cols[0].trim();
      cIndex = 1;
    } else if (!cols[0]) {
      cIndex = 1;
    }
    
    const kompartemen = cols[cIndex] ? cols[cIndex].trim() : '';
    const unitKerja = cols[cIndex + 1] ? cols[cIndex + 1].trim() : '';
    const asosiasi = cols[cIndex + 2] ? cols[cIndex + 2].trim() : '';
    const periode = cols[cIndex + 3] ? cols[cIndex + 3].trim() : '';
    const nominalStr = cols[cIndex + 4] ? cols[cIndex + 4].trim() : '';
    let nominal = 0;
    if (nominalStr) {
      nominal = parseInt(nominalStr.replace(/\D/g, ''), 10) || 0;
    }
    
    const status = cols[cIndex + 5] ? cols[cIndex + 5].trim() : '';
    const nama = cols[cIndex + 6] ? cols[cIndex + 6].trim() : '';
    const npk = cols[cIndex + 7] ? cols[cIndex + 7].trim() : '';
    const keterangan = cols[cIndex + 8] ? cols[cIndex + 8].trim() : '';
    
    dataToInsert.push({
      nomer,
      kompartemen,
      unitKerja,
      asosiasi,
      periode,
      nominal,
      status,
      nama,
      npk,
      keterangan
    });
  }

  await prisma.iuranKeanggotaan.createMany({
    data: dataToInsert
  });

  console.log(`✅ Berhasil menyisipkan ${dataToInsert.length} data iuran.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
