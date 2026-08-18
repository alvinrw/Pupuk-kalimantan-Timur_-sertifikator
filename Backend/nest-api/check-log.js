const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLog() {
  const logs = await prisma.monitoringLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  logs.forEach((log, i) => {
    console.log(`\n--- Log [${i}] ---`);
    console.log(`ID:`, log.id);
    console.log(`Action:`, log.action);
    console.log(`Status:`, log.status);
    console.log(`CreatedAt:`, log.createdAt);
    console.log(`Details:`, log.detail);
  });
  prisma.$disconnect();
}
checkLog();
