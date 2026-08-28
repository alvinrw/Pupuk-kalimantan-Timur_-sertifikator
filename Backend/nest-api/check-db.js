const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const items = await prisma.masterItem.findMany({
    where: { id: { in: ['peralatan-pabrik', 'perizinan-aset', 'perizinan-produk', 'perizinan-proyek', 'administrasi-lainnya'] } }
  });
  console.log('Items:', items);
}
main();
