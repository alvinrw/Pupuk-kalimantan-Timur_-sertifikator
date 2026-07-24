import { Module } from '@nestjs/common';
import { DocumentHistoryController } from './document-history.controller';
import { DocumentHistoryService } from './document-history.service';

@Module({
  controllers: [DocumentHistoryController],
  providers: [DocumentHistoryService],
  exports: [DocumentHistoryService],
})
export class DocumentHistoryModule {}
