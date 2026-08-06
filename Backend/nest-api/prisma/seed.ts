import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data awal untuk Role dan User...');

  // 1. Buat Roles
  const roles = ['Admin 1', 'Admin 2', 'Admin 3', 'User', 'Viewer'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `Role akses untuk ${roleName}` },
    });
  }
  console.log('✅ Roles berhasil dibuat/diperbarui.');

  // 2. Ambil Role "Admin 1"
  const admin1Role = await prisma.role.findUnique({
    where: { name: 'Admin 1' },
  });

  if (!admin1Role) {
    throw new Error('Gagal menemukan Role Admin 1');
  }

  // 3. Buat Akun Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: 'muhfi_admin' },
    update: {
      password: hashedPassword, // Reset password jika dijalankan ulang
    },
    create: {
      nama: 'Muhfi',
      npk: 'PKT12345',
      username: 'muhfi_admin',
      password: hashedPassword,
      roleId: admin1Role.id,
    },
  });

  console.log('✅ Super Admin berhasil dibuat:', superAdmin.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
