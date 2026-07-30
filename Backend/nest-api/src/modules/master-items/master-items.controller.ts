import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { MasterItemsService } from './master-items.service';
import { CreateMasterItemDto } from './dto/create-master-item.dto';
import { UpdateMasterItemDto } from './dto/update-master-item.dto';

@Controller('master-items')
export class MasterItemsController {
  constructor(private readonly masterItemsService: MasterItemsService) {}

  @Post('reminders/trigger')
  triggerDeadlineCheck() {
    return this.masterItemsService.runDeadlineCheck();
  }

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

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMasterItemDto: UpdateMasterItemDto) {
    return this.masterItemsService.update(id, updateMasterItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterItemsService.remove(id);
  }

  @Patch(':id/resolve-exemption')
  resolveExemption(
    @Param('id') id: string,
    @Body('note') note: string,
  ) {
    return this.masterItemsService.resolveExemption(id, note);
  }

  @Put(':id/notification-setting')
  updateNotificationSetting(
    @Param('id') itemId: string,
    @Body() body: { isEnabled: boolean; triggerType: string; triggerDays: number; triggerDate?: string | null },
  ) {
    return this.masterItemsService.updateNotificationSetting(itemId, body);
  }
}

