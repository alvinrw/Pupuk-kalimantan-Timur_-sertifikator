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
    
    // [FIX L-01] Pesan error generik untuk mencegah user enumeration
    if (!user) {
      throw new UnauthorizedException('Username atau password tidak valid.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Username atau password tidak valid.');
    }

    const payload = {
      sub: user.id,
      username: user.username,
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

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role.name,
        npk: user.npk,
      }
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const isBlacklisted = await this.prisma.tokenBlacklist.findUnique({
        where: { token: refreshToken }
      });
      if (isBlacklisted) {
        throw new UnauthorizedException('Token is blacklisted.');
      }
      
      const newPayload = { sub: payload.sub, username: payload.username, role: payload.role, npk: payload.npk };
      const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '15m' });
      return { access_token: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
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

  async blacklistTokens(tokens: string[]) {
    for (const token of tokens) {
      if (!token) continue;
      try {
        const decoded = this.jwtService.decode(token) as any;
        if (decoded && decoded.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          await this.prisma.tokenBlacklist.create({
            data: { token, expiresAt }
          }).catch(() => {}); // ignore duplicates
        }
      } catch (e) {
        // invalid token format
      }
    }
  }
}
