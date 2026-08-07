import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating roles in DB...');

  // 1. Rename Admin 1 to Super Admin
  const admin1 = await prisma.role.findUnique({ where: { name: 'Admin 1' } });
  if (admin1) {
    await prisma.role.update({
      where: { id: admin1.id },
      data: { name: 'Super Admin', description: 'Role akses untuk Super Admin' }
    });
    console.log('Renamed Admin 1 to Super Admin');
  }

  // 2. Handle Admin 2 and Admin 3
  const admin2 = await prisma.role.findUnique({ where: { name: 'Admin 2' } });
  const admin3 = await prisma.role.findUnique({ where: { name: 'Admin 3' } });

  let targetAdminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });

  if (!targetAdminRole) {
    if (admin2) {
      targetAdminRole = await prisma.role.update({
        where: { id: admin2.id },
        data: { name: 'Admin', description: 'Role akses untuk Admin' }
      });
      console.log('Renamed Admin 2 to Admin');
    } else if (admin3) {
      targetAdminRole = await prisma.role.update({
        where: { id: admin3.id },
        data: { name: 'Admin', description: 'Role akses untuk Admin' }
      });
      console.log('Renamed Admin 3 to Admin');
    } else {
      targetAdminRole = await prisma.role.create({
        data: { name: 'Admin', description: 'Role akses untuk Admin' }
      });
      console.log('Created Admin role');
    }
  }

  // Migrate users from Admin 2 to Admin if Admin 2 wasn't renamed
  if (admin2 && targetAdminRole.id !== admin2.id) {
    await prisma.user.updateMany({
      where: { roleId: admin2.id },
      data: { roleId: targetAdminRole.id }
    });
    await prisma.role.delete({ where: { id: admin2.id } });
    console.log('Migrated Admin 2 users and deleted Admin 2');
  }

  // Migrate users from Admin 3 to Admin
  if (admin3 && targetAdminRole.id !== admin3.id) {
    await prisma.user.updateMany({
      where: { roleId: admin3.id },
      data: { roleId: targetAdminRole.id }
    });
    await prisma.role.delete({ where: { id: admin3.id } });
    console.log('Migrated Admin 3 users and deleted Admin 3');
  }

  console.log('Role migration completed!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
