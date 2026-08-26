const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.masterItem.findMany({
    include: { certificates: true }
  });
  
  let updatedCount = 0;
  for (const item of items) {
    if (item.certificates && item.certificates.length > 0 && item.documentStatus === 'PENDING_DOC') {
      await prisma.masterItem.update({
        where: { id: item.id },
        data: { documentStatus: 'COMPLETED' }
      });
      updatedCount++;
    }
  }
  
  console.log(Berhasil memperbarui  data PENDING_DOC yang memiliki sertifikat menjadi COMPLETED.);
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
