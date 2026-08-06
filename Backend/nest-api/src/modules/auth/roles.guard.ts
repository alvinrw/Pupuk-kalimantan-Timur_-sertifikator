import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true; // Endpoint publik/bebas

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Didapat dari JwtAuthGuard

    if (!user) {
        throw new ForbiddenException('User tidak terautentikasi.');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Akses Ditolak. Membutuhkan role: ${requiredRoles.join(', ')}`);
    }
    return true;
  }
}
