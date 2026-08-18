const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const master = await prisma.masterItem.findFirst({
    where: { code: 'CR-001' },
    include: { certificates: true }
  });
  console.log(JSON.stringify(master, null, 2));
}

check()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
