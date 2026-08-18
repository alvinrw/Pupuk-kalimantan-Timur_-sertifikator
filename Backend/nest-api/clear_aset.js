const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.masterItem.deleteMany({
    where: { categoryKey: 'perizinan-aset' },
  });
  console.log(`Deleted ${result.count} records for perizinan-aset`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
