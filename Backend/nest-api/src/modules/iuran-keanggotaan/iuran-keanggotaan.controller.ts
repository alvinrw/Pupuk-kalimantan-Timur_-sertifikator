import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IuranKeanggotaanService } from './iuran-keanggotaan.service';
import { CreateIuranDto } from './dto/create-iuran.dto';
import { UpdateIuranDto } from './dto/update-iuran.dto';

@Controller('iuran-keanggotaan')
export class IuranKeanggotaanController {
  constructor(private readonly iuranService: IuranKeanggotaanService) {}

  @Post()
  create(@Body() createIuranDto: CreateIuranDto) {
    return this.iuranService.create(createIuranDto);
  }

  @Get()
  findAll() {
    return this.iuranService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.iuranService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIuranDto: UpdateIuranDto) {
    return this.iuranService.update(id, updateIuranDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.iuranService.remove(id);
  }
}
