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

    // Support wildcard matching for Admin 1, Admin 2, Admin 3
    const hasRole = requiredRoles.some(role => {
      if (role === 'Admin' && user.role.startsWith('Admin')) return true;
      return role === user.role;
    });

    if (!hasRole) {
      throw new ForbiddenException(`Akses Ditolak. Membutuhkan role: ${requiredRoles.join(', ')}`);
    }
    return true;
  }
}
