import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id || req.user?.sub;
    // If the request is authenticated, update lastActive
    if (userId) {
      this.prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() }
      }).catch(err => {
        console.error('Failed to update lastActive for user', userId, err);
      });
    }
    
    return next.handle().pipe(
      concatMap(async (responseData) => {
        const method = req.method;
        if (userId && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const url = req.originalUrl || req.url;
          if (!url.includes('/auth/')) {
            let action = 'UPDATE';
            if (method === 'POST') action = 'INSERT';
            if (method === 'DELETE') action = 'DELETE';
            
            const pathSegments = url.split('?')[0].split('/').filter(s => s.length > 0);
            const moduleName = pathSegments.length > 2 ? pathSegments[2] : 'unknown';
            
            let targetId = null;
            const lastSegment = pathSegments[pathSegments.length - 1];
            if (lastSegment && lastSegment !== moduleName && !['create', 'update', 'delete', 'bulk'].includes(lastSegment)) {
              targetId = lastSegment;
            }

            const safeBody = req.body ? { ...req.body } : {};
            if (safeBody.password) safeBody.password = '***';
            
            try {
              await this.prisma.activityLog.create({
                data: {
                  userId: userId,
                  action: action,
                  targetTable: moduleName,
                  targetId: targetId || null,
                  details: JSON.stringify({ method, url, body: safeBody }),
                }
              });
            } catch (err) {
              console.error('Failed to create activity log', err);
            }
          }
        }
        return responseData;
      })
    );
  }
}
