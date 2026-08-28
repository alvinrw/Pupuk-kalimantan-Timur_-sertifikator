const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulate() {
  const rawCategory = 'perizinan-aset';
  const rawTitle = 'Overhead Crane 1 Ton';
  const rawCode = 'CR-001';

  const existingInDb = await prisma.masterItem.findFirst({
    where: {
      categoryKey: rawCategory,
      title: { equals: rawTitle, mode: 'insensitive' },
      code: { equals: rawCode, mode: 'insensitive' },
    },
    select: { id: true, documentStatus: true, isManuallyEdited: true }
  });

  console.log("existingInDb:", existingInDb);
}

simulate()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
