import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete , UseGuards } from '@nestjs/common';
import { IuranKeanggotaanService } from './iuran-keanggotaan.service';
import { CreateIuranDto } from './dto/create-iuran.dto';
import { UpdateIuranDto } from './dto/update-iuran.dto';

@Controller('iuran-keanggotaan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User', 'Viewer')
export class IuranKeanggotaanController {
  constructor(private readonly iuranService: IuranKeanggotaanService) {}

  @Roles('Super Admin', 'Admin', 'User')
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

  @Roles('Super Admin', 'Admin', 'User')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIuranDto: UpdateIuranDto) {
    return this.iuranService.update(id, updateIuranDto);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.iuranService.remove(id);
  }
}
