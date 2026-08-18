const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLog() {
  const log = await prisma.monitoringLog.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(log, null, 2));
}

checkLog()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
