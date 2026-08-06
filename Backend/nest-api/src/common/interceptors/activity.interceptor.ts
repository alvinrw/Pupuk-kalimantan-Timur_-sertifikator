import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    // If the request is authenticated, update lastActive
    if (req.user && req.user.id) {
      this.prisma.user.update({
        where: { id: req.user.id },
        data: { lastActive: new Date() }
      }).catch(err => {
        console.error('Failed to update lastActive for user', req.user.id, err);
      });
    } else if (req.user && req.user.sub) {
      this.prisma.user.update({
        where: { id: req.user.sub },
        data: { lastActive: new Date() }
      }).catch(err => {
        console.error('Failed to update lastActive for user', req.user.sub, err);
      });
    }
    
    return next.handle();
  }
}
