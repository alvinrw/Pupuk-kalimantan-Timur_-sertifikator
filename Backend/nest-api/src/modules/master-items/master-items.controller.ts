import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseGuards, Req } from '@nestjs/common';
import { MasterItemsService } from './master-items.service';
import { CreateMasterItemDto } from './dto/create-master-item.dto';
import { UpdateMasterItemDto } from './dto/update-master-item.dto';
import { PrismaService } from '../../database/prisma.service';

@Controller('master-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User', 'Viewer')
export class MasterItemsController {
  constructor(
    private readonly masterItemsService: MasterItemsService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles('Super Admin', 'Admin', 'User')
  @Post('reminders/trigger')
  triggerDeadlineCheck() {
    return this.masterItemsService.runDeadlineCheck();
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Post('check-duplicate')
  checkDuplicate(@Body() body: { title: string, code: string, unitLocation: string, nomorSeri: string, excludeId?: string }) {
    return this.masterItemsService.checkDuplicate(body);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Post()
  async create(@Body() createMasterItemDto: CreateMasterItemDto, @Req() req: any) {
    const item = await this.masterItemsService.create(createMasterItemDto);
    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'INSERT',
        targetTable: item.categoryKey || 'master_items',
        targetId: item.title || item.id,
        details: JSON.stringify({ message: `Membuat Master Item: ${item.title}` }),
      },
    }).catch(() => {});
    return item;
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
  async update(@Param('id') id: string, @Body() updateMasterItemDto: UpdateMasterItemDto, @Req() req: any) {
    const original = await this.masterItemsService.findOne(id).catch(() => null);
    const updated = await this.masterItemsService.update(id, updateMasterItemDto);
    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        targetTable: updated.categoryKey || 'master_items',
        targetId: updated.title || updated.id,
        details: JSON.stringify({ 
          message: `Mengupdate Master Item: ${updated.title}`,
          changes: {
            before: original ? { title: original.title, status: original.status, unitLocation: original.unitLocation } : {},
            after: { title: updated.title, status: updated.status, unitLocation: updated.unitLocation }
          }
        }),
      },
    }).catch(() => {});
    return updated;
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const original = await this.masterItemsService.findOne(id).catch(() => null);
    const deleted = await this.masterItemsService.remove(id);
    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        targetTable: original?.categoryKey || 'master_items',
        targetId: original?.title || id,
        details: JSON.stringify({ message: `Menghapus Master Item: ${original?.title || id}` }),
      },
    }).catch(() => {});
    return deleted;
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Patch(':id/resolve-exemption')
  async resolveExemption(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    const item = await this.masterItemsService.resolveExemption(id, note);
    return item;
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Put(':id/notification-setting')
  async updateNotificationSetting(
    @Param('id') itemId: string,
    @Body() body: { isEnabled: boolean; triggerType: string; triggerDays: number; triggerDate?: string | null; certificateId?: string | null },
    @Req() req: any,
  ) {
    console.log(`[DEBUG] updateNotificationSetting called with itemId: ${itemId}, body:`, body);
    const res = await this.masterItemsService.updateNotificationSetting(itemId, body);
    return res;
  }
}

