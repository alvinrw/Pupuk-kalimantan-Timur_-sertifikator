const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log('Total users in DB:', users.length);
  console.log(users.map(u => u.username));
}

check().catch(console.error).finally(() => prisma.$disconnect());
