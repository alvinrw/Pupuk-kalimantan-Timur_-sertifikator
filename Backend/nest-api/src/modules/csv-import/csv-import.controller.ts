import { Controller, Post, Get, Delete, Param, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvImportService } from './csv-import.service';

@Controller('csv-import')
export class CsvImportController {
  constructor(private readonly csvImportService: CsvImportService) {}

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

  @Post('bulk-nested')
  async bulkNested(
    @Body('data') data: any[],
    @Body('categoryKey') categoryKey: string
  ) {
    if (!data || !Array.isArray(data)) {
      throw new HttpException('Data array is required', HttpStatus.BAD_REQUEST);
    }
    return this.csvImportService.processBulkNested(data, categoryKey);
  }

  @Get('history')
  async getHistory(@Query('categoryKey') categoryKey?: string) {
    return this.csvImportService.getImportHistory(categoryKey);
  }

  @Delete('history/:id')
  async deleteHistory(@Param('id') id: string) {
    return this.csvImportService.deleteImportHistory(id);
  }
}
