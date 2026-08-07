import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          if (req && req.query && req.query.token) {
            return req.query.token as string;
          }
          return null;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY_SEMENTARA_SANGAT_RAHASIA',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      npk: payload.npk,
    };
  }
}
