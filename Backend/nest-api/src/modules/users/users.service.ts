import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: any, currentUser?: any) {
    const { roleName, ...userData } = createUserDto;
    
    // Hanya Super Admin yang bisa membuat akun Super Admin
    if (roleName === 'Super Admin' && currentUser?.role !== 'Super Admin') {
      throw new ForbiddenException('Hanya Super Admin yang diizinkan untuk membuat akun Super Admin baru.');
    }

    // Cari roleId berdasarkan roleName
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new NotFoundException(`Role ${roleName} tidak ditemukan`);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roleId: role.id
      },
      select: { id: true, nama: true, username: true, npk: true, role: true }
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, nama: true, username: true, npk: true, role: true, lastActive: true }
    });
    
    return users.map(user => {
      // 5 minutes threshold
      const isOnline = user.lastActive ? (Date.now() - user.lastActive.getTime() < 5 * 60 * 1000) : false;
      return {
        id: user.id,
        nama: user.nama,
        username: user.username,
        npk: user.npk,
        role: user.role,
        isOnline,
      };
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, nama: true, username: true, npk: true, role: true, lastActive: true }
    });
    
    if (!user) return null;
    
    const isOnline = user.lastActive ? (Date.now() - user.lastActive.getTime() < 5 * 60 * 1000) : false;
    return { ...user, isOnline };
  }

  async update(id: string, updateUserDto: any, currentUser?: any) {
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    
    if (!userToUpdate) throw new NotFoundException('User tidak ditemukan');
    
    if (userToUpdate.role.name === 'Super Admin') {
      // Jika yang di-edit adalah Super Admin, pastikan yang mengedit adalah dirinya sendiri
      if (!currentUser || currentUser.id !== userToUpdate.id) {
        throw new ForbiddenException('Super Admin (Super Admin) hanya dapat diedit oleh dirinya sendiri.');
      }
    }

    const { roleName, ...data } = updateUserDto;
    
    if (roleName) {
      if (roleName === 'Super Admin' && currentUser?.role !== 'Super Admin') {
        throw new ForbiddenException('Hanya Super Admin yang diizinkan untuk mengubah role pengguna menjadi Super Admin.');
      }

      const role = await this.prisma.role.findUnique({ where: { name: roleName } });
      if (!role) throw new NotFoundException(`Role ${roleName} tidak ditemukan`);
      (data as any).roleId = role.id;
    }

    if (data.password) {
      // Hanya Super Admin yang bisa mengubah password Viewer
      if (userToUpdate.role.name === 'Viewer' && currentUser?.role !== 'Super Admin') {
        throw new ForbiddenException('Hanya Super Admin yang diizinkan untuk mengubah password akun Viewer.');
      }
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, nama: true, username: true, npk: true, role: true }
    });
  }


  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (user.role.name === 'Viewer') {
      throw new ForbiddenException('Viewer tidak diizinkan mengubah password. Silakan hubungi Super Admin.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new ForbiddenException('Password saat ini salah');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { id: true, nama: true, username: true }
    });
  }


  async remove(id: string) {
    const userToDelete = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!userToDelete) throw new NotFoundException('User tidak ditemukan');

    if (userToDelete.role.name === 'Super Admin') {
      throw new ForbiddenException('Super Admin (Super Admin) tidak dapat dihapus oleh siapapun.');
    }

    // Hapus terlebih dahulu semua activity log yang terhubung dengan user ini
    // untuk mencegah error "Foreign key constraint violated"
    await this.prisma.activityLog.deleteMany({
      where: { userId: id }
    });

    return this.prisma.user.delete({
      where: { id }
    });
  }
}
