import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ColumnConfigsService } from './column-configs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('column-configs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User', 'Viewer')
export class ColumnConfigsController {
  constructor(private readonly columnConfigsService: ColumnConfigsService) {}

  @Get(':categoryKey')
  findAll(@Param('categoryKey') categoryKey: string) {
    return this.columnConfigsService.findAll(categoryKey);
  }

  @Roles('Super Admin', 'Admin')
  @Post(':categoryKey')
  create(
    @Param('categoryKey') categoryKey: string,
    @Body() body: { fieldKey: string; label: string; type: string }
  ) {
    return this.columnConfigsService.create(categoryKey, body);
  }

  @Roles('Super Admin', 'Admin')
  @Put(':categoryKey/reorder')
  reorder(
    @Param('categoryKey') categoryKey: string,
    @Body() body: { fieldKey: string; position: number; isVisible: boolean }[]
  ) {
    return this.columnConfigsService.reorder(categoryKey, body);
  }

  @Roles('Super Admin', 'Admin')
  @Delete(':categoryKey/:fieldKey')
  remove(
    @Param('categoryKey') categoryKey: string,
    @Param('fieldKey') fieldKey: string
  ) {
    return this.columnConfigsService.remove(categoryKey, fieldKey);
  }
}
