const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database for MasterItem, Certificate, Permit...');
  
  await prisma.certificate.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.documentHistory.deleteMany();
  await prisma.masterItem.deleteMany();
  await prisma.monitoringLog.deleteMany();

  console.log('Successfully deleted all records from MasterItem and related tables!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
