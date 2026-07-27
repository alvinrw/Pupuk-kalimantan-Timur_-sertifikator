const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Update all existing items to COMPLETED so legacy data is not stuck in Staging
  const result = await prisma.masterItem.updateMany({
    where: {
      documentStatus: 'PENDING_DOC'
    },
    data: {
      documentStatus: 'COMPLETED'
    }
  });

  console.log(`Berhasil memperbarui ${result.count} data lama menjadi status COMPLETED.`);
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
