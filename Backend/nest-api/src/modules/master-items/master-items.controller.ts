import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put , UseGuards } from '@nestjs/common';
import { MasterItemsService } from './master-items.service';
import { CreateMasterItemDto } from './dto/create-master-item.dto';
import { UpdateMasterItemDto } from './dto/update-master-item.dto';

@Controller('master-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User', 'Viewer')
export class MasterItemsController {
  constructor(private readonly masterItemsService: MasterItemsService) {}

  @Roles('Super Admin', 'Admin', 'User')
  @Post('reminders/trigger')
  triggerDeadlineCheck() {
    return this.masterItemsService.runDeadlineCheck();
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Post()
  create(@Body() createMasterItemDto: CreateMasterItemDto) {
    return this.masterItemsService.create(createMasterItemDto);
  }

  @Get()
  findAll(
    @Query('categoryKey') categoryKey?: string,
    @Query('search') search?: string,
  ) {
    return this.masterItemsService.findAll(categoryKey, search);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Get('reminders/tasks')
  getTaskCenterData() {
    return this.masterItemsService.getTaskCenterData();
  }

  @Get('reminders/active')
  findActiveReminders() {
    return this.masterItemsService.findActiveReminders();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterItemsService.findOne(id);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMasterItemDto: UpdateMasterItemDto) {
    return this.masterItemsService.update(id, updateMasterItemDto);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterItemsService.remove(id);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Patch(':id/resolve-exemption')
  resolveExemption(
    @Param('id') id: string,
    @Body('note') note: string,
  ) {
    return this.masterItemsService.resolveExemption(id, note);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Put(':id/notification-setting')
  updateNotificationSetting(
    @Param('id') itemId: string,
    @Body() body: { isEnabled: boolean; triggerType: string; triggerDays: number; triggerDate?: string | null; certificateId?: string | null },
  ) {
    return this.masterItemsService.updateNotificationSetting(itemId, body);
  }
}

