const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const items = await prisma.masterItem.findMany({
    select: { id: true, categoryKey: true, documentStatus: true }
  });
  console.log('Total items:', items.length);
  
  const statusCounts = {};
  items.forEach(i => {
    statusCounts[i.documentStatus] = (statusCounts[i.documentStatus] || 0) + 1;
  });
  console.log('documentStatus counts:', statusCounts);
}
check().finally(() => prisma.());
