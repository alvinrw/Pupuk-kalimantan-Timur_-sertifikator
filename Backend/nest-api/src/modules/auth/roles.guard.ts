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

    const userRole = user.role ? String(user.role).toLowerCase() : '';

    // Support wildcard matching for Admin 1, Admin 2, dll
    const hasRole = requiredRoles.some(role => {
      const reqRole = role.toLowerCase();
      if (reqRole === 'admin' && userRole.includes('admin')) return true;
      if (reqRole === 'super admin' && (userRole.includes('admin 1') || userRole.includes('super'))) return true;
      return reqRole === userRole;
    });

    if (!hasRole) {
      throw new ForbiddenException(`Akses Ditolak. Membutuhkan role: ${requiredRoles.join(', ')}`);
    }
    return true;
  }
}
