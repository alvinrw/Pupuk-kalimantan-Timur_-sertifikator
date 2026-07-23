import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentQueryDto } from './dto/equipment-query.dto';

@ApiTags('Peralatan Pabrik')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @ApiOperation({ summary: 'Mengambil list data perizinan peralatan pabrik (dengan filter & pagination)' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil list data peralatan' })
  findAll(@Query() query: EquipmentQueryDto) {
    return this.equipmentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mengambil detail perizinan peralatan pabrik berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Menambahkan data perizinan peralatan baru' })
  create(@Body() createDto: CreateEquipmentDto) {
    return this.equipmentService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Memperbarui data perizinan peralatan pabrik' })
  update(@Param('id') id: string, @Body() updateDto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus data perizinan peralatan pabrik' })
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id);
  }
}
