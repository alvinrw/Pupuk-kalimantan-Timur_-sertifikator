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
        (request: any) => {
          return request?.cookies?.access_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Check blacklist
    const token = req.cookies?.access_token || ExtractJwt.fromAuthHeaderAsBearerToken()(req) || ExtractJwt.fromUrlQueryParameter('token')(req);
    
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
      role: payload.role,
      npk: payload.npk,
    };
  }
}
