import { Controller, Get, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin 1', 'Admin 2', 'Admin 3')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  findAll() {
    return this.activityLogsService.findAll();
  }
}
