import { Module } from '@nestjs/common';
import { DocumentHistoryController } from './document-history.controller';
import { DocumentHistoryService } from './document-history.service';
import { PdfWatermarkService } from './pdf-watermark.service';

@Module({
  controllers: [DocumentHistoryController],
  providers: [DocumentHistoryService, PdfWatermarkService],
  exports: [DocumentHistoryService, PdfWatermarkService],
})
export class DocumentHistoryModule {}
