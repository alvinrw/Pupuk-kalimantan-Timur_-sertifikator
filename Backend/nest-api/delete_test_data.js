const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const result = await prisma.masterItem.deleteMany({
    where: {
      OR: [
        { id: { contains: 'TEST' } },
        { title: { contains: 'Testing' } }
      ]
    }
  });
  console.log(`Berhasil menghapus ${result.count} data testing dari database.`);
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
