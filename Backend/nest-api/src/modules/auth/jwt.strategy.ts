import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) => {
          return request?.cookies?.access_token;
        },
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Check blacklist
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) || req.cookies?.access_token || ExtractJwt.fromUrlQueryParameter('token')(req);
    
    if (token) {
      const isBlacklisted = await this.prisma.tokenBlacklist.findUnique({
        where: { token }
      });
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked.');
      }
    }

    return {
      id: payload.sub,
      username: payload.username,
      nama: payload.nama,
      role: payload.role,
      npk: payload.npk,
    };
  }
}
