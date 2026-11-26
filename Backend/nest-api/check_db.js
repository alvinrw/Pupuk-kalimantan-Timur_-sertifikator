// @ts-nocheck
const prismaPkg = '@prisma/client';
const { PrismaClient } = require(prismaPkg);
const prisma = new PrismaClient();

async function main() {
  const keanggotaan = await prisma.columnConfig.findMany({
    where: { categoryKey: 'iuran-keanggotaan' },
    orderBy: { position: 'asc' }
  });
  console.log('=== KEANGGOTAAN COLUMNS IN DB ===');
  console.table(keanggotaan.map(c => ({ position: c.position, fieldKey: c.fieldKey, label: c.label, isCustom: c.isCustom })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
