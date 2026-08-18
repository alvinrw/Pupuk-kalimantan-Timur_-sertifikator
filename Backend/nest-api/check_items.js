const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.masterItem.findMany({
    include: {
      certificates: true
    }
  });
  console.log('All Master Items count:', items.length);
  const nitrogenItems = items.filter(i => i.title.includes('Nitrogen'));
  console.log('Nitrogen items details:', JSON.stringify(nitrogenItems.map(i => ({
    id: i.id,
    title: i.title,
    documentStatus: i.documentStatus,
    categoryKey: i.categoryKey,
    certsCount: i.certificates.length,
    certs: i.certificates.map(c => ({ id: c.id, noSertifikat: c.noSertifikat, status: c.status, expired: c.expired }))
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
