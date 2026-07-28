const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const items = await prisma.masterItem.findMany({ take: 5, where: { categoryKey: 'peralatan-pabrik' } }); 
  console.log('--- DB Items Fallback Keys ---');
  items.forEach(e => {
    console.log(`[DB] title=${e.title}, loc=${e.unitLocation}, cat=${e.categoryKey}`);
    console.log(`FallbackKey: ${(e.title || '').trim().toLowerCase()}_${(e.unitLocation || '').trim().toLowerCase()}_${(e.categoryKey || '').trim().toLowerCase()}`);
  });
} 
main();
