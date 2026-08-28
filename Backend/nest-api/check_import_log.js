const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const log = await prisma.monitoringLog.findFirst({
    where: { action: 'CSV_IMPORT' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, detail: true }
  });

  if (!log) { console.log('No logs found'); return; }

  const d = JSON.parse(log.detail);
  console.log('File:', d.fileName);
  console.log('Total rows:', d.totalRows || d.importedCount);
  console.log('Success:', d.successCount);
  console.log('Duplicates:', d.duplicateCount);
  console.log('Protected:', d.protectedCount);
  console.log('Failed:', d.failCount);
  console.log('Category:', d.categoryKey);
  if (d.failedRows && d.failedRows.length > 0) {
    console.log('\nFailed/Duplicate rows (first 10):');
    console.log(JSON.stringify(d.failedRows.slice(0, 10), null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
