import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { MasterItemsService } from './master-items.service';
import { CreateMasterItemDto } from './dto/create-master-item.dto';
import { UpdateMasterItemDto } from './dto/update-master-item.dto';

@Controller('master-items')
export class MasterItemsController {
  constructor(private readonly masterItemsService: MasterItemsService) {}

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
}

