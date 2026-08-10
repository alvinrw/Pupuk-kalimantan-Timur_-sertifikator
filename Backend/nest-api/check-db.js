const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const validCategories = [
    'peralatan-pabrik', 'perizinan-aset', 'administrasi-lainnya',
    'bangunan-generic', 'lingkungan-generic', 'kesehatan-generic',
    'proteksi-kebakaran', 'pesawat-angkat-angkut', 'pesawat-tenaga-produksi',
    'instalasi-penyalur-petir', 'esdm-generic', 'komunikasi-generic',
    'disnaker-generic', 'haki-generic'
  ];

  // Find all items with corrupted categoryKeys (e.g. titles)
  const items = await prisma.masterItem.findMany();
  console.log(`Total master items: ${items.length}`);

  let restoredCount = 0;
  for (const item of items) {
    if (!validCategories.includes(item.categoryKey)) {
      console.log(`Restoring item "${item.title}" with code "${item.code}" and bad categoryKey "${item.categoryKey}" to "peralatan-pabrik"`);
      await prisma.masterItem.update({
        where: { id: item.id },
        data: { categoryKey: 'peralatan-pabrik' }
      });
      restoredCount++;
    }
  }
  console.log(`Restoration complete! Restored ${restoredCount} items.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
