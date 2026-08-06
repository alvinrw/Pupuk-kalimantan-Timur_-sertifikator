import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const logs = await this.prisma.activityLog.findMany({
      include: {
        user: {
          include: { role: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      user: log.user.nama,
      role: log.user.role.name,
      action: log.action,
      module: log.targetTable,
      target: log.targetId || '-'
    }));
  }
}
