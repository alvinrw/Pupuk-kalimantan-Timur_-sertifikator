import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data awal untuk Role dan User...');

  // 1. Buat Roles
  const roles = ['Super Admin', 'Admin', 'User', 'Viewer'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `Role akses untuk ${roleName}` },
    });
  }
  console.log('✅ Roles berhasil dibuat/diperbarui.');

  // 2. Ambil Role "Super Admin"
  const admin1Role = await prisma.role.findUnique({
    where: { name: 'Super Admin' },
  });

  if (!admin1Role) {
    throw new Error('Gagal menemukan Role Super Admin');
  }

  // 3. Buat Akun Super Admin
  const defaultPassword = process.env.SUPER_ADMIN_PASSWORD;
  const adminName = process.env.SUPER_ADMIN_NAME || 'Muhfi';
  const adminUsername = process.env.SUPER_ADMIN_USERNAME || 'muhfi_admin';
  const adminNpk = process.env.SUPER_ADMIN_NPK || 'PKT12345';
  
  if (!defaultPassword && process.env.NODE_ENV === 'production') {
    throw new Error('❌ Batal Seeding: SUPER_ADMIN_PASSWORD wajib diset di file .env untuk lingkungan production!');
  }

  const finalPassword = defaultPassword || 'admin123';
  const hashedPassword = await bcrypt.hash(finalPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      password: hashedPassword, // Update password saat seeding ulang
      nama: adminName,
      npk: adminNpk,
    },
    create: {
      nama: adminName,
      npk: adminNpk,
      username: adminUsername,
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
