import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register({ nama, npk, username, password, roleId }) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ npk }, { username }] },
    });
    if (exists) {
      throw new BadRequestException('NPK atau Username sudah terpakai!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { nama, npk, username, password: hashedPassword, roleId },
    });
  }

  async login(username: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });
    
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role.name,
      npk: user.npk,
    };

    // Catat log aktivitas login
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        targetTable: 'users',
        targetId: user.id,
        details: JSON.stringify({ message: 'User logged in successfully' }),
      },
    });

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role.name,
        npk: user.npk,
      }
    };
  }

  async logout(userId: string) {
    // Set lastActive ke 0 untuk menandakan offline seketika
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date(0) }
    });

    // Catat log aktivitas logout
    await this.prisma.activityLog.create({
      data: {
        userId: userId,
        action: 'LOGOUT',
        targetTable: 'users',
        targetId: userId,
        details: JSON.stringify({ message: 'User logged out successfully' }),
      },
    });

    return { status: 'ok', message: 'Logged out successfully' };
  }
}
