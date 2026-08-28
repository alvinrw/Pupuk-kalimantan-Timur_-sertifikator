const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Mulai menghapus data Perizinan Aset dari database...');
  
  try {
    const result = await prisma.masterItem.deleteMany({
      where: {
        categoryKey: 'perizinan-aset'
      }
    });
    console.log(`✅ Berhasil menghapus ${result.count} data Perizinan Aset beserta seluruh histori dan sertifikat terkait.`);
  } catch (error) {
    console.error('❌ Gagal menghapus data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
