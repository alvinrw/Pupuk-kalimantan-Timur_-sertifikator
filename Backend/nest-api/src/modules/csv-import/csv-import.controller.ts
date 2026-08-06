import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Post, Get, Delete, Param, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus, Body , UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvImportService } from './csv-import.service';

@Controller('csv-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin 1', 'Admin 2', 'Admin 3', 'User', 'Viewer')
export class CsvImportController {
  constructor(private readonly csvImportService: CsvImportService) {}

  @Roles('Admin 1', 'Admin 2', 'Admin 3', 'User')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: any,
    @Body('type') type: string, // 'master_items', 'certificates', or 'permits'
    @Body('categoryKey') categoryKey?: string
  ) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }
    if (!type) {
      throw new HttpException('Type is required (master_items/certificates/permits)', HttpStatus.BAD_REQUEST);
    }

    return this.csvImportService.processCsv(file, type, categoryKey);
  }

  @Get('history')
  async getHistory(@Query('categoryKey') categoryKey?: string) {
    return this.csvImportService.getImportHistory(categoryKey);
  }

  @Roles('Admin 1', 'Admin 2', 'Admin 3', 'User')
  @Delete('history/:id')
  async deleteHistory(@Param('id') id: string) {
    return this.csvImportService.deleteImportHistory(id);
  }
}
