const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipe() {
  await prisma.documentHistory.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.monitoringLog.deleteMany();
  await prisma.masterItem.deleteMany();
  console.log('DATABASE BERHASIL DIKOSONGKAN 100% BLANK!');
}

wipe().finally(() => prisma.$disconnect());
