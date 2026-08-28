const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.user.findMany({ include: { role: true } });
  console.log(users.map(u => ({ username: u.username, role: u.role?.name })));
  prisma.$disconnect();
}
checkUser();
