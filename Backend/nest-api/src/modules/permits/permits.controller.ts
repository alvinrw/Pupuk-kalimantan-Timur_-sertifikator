import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PermitsService } from './permits.service';
import { CreatePermitDto } from './dto/create-permit.dto';
import { UpdatePermitDto } from './dto/update-permit.dto';

@Controller('permits')
export class PermitsController {
  constructor(private readonly permitsService: PermitsService) {}

  @Post()
  create(@Body() createPermitDto: CreatePermitDto) {
    return this.permitsService.create(createPermitDto);
  }

  @Get()
  findAll() {
    return this.permitsService.findAll();
  }

  @Get('item/:itemId')
  findByItemId(@Param('itemId') itemId: string) {
    return this.permitsService.findByItemId(itemId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermitDto: UpdatePermitDto) {
    return this.permitsService.update(id, updatePermitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permitsService.remove(id);
  }
}
