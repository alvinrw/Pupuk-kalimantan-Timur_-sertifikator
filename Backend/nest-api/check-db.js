const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { role: true } });
  console.log('USERS:', JSON.stringify(users, null, 2));
  
  const logs = await prisma.activityLog.findMany();
  console.log('LOGS:', JSON.stringify(logs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
