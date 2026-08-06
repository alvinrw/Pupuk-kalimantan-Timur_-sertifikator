const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  const getRoleId = (name) => roles.find(r => r.name === name).id;
  const password = await bcrypt.hash('password123', 10);

  const mockUsers = [
    { nama: 'Alvin Admin', npk: 'PKT54321', username: 'alvin_admin2', password, roleId: getRoleId('Admin 2') },
    { nama: 'Budi Santoso', npk: 'PKT99887', username: 'budi_user', password, roleId: getRoleId('User') },
    { nama: 'Siti Aminah', npk: 'PKT11223', username: 'siti_viewer', password, roleId: getRoleId('Viewer') }
  ];

  for (const u of mockUsers) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: u
    });
  }
  console.log('Mock users created successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
