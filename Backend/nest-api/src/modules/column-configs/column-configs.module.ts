import { Module } from '@nestjs/common';
import { ColumnConfigsController } from './column-configs.controller';
import { ColumnConfigsService } from './column-configs.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ColumnConfigsController],
  providers: [ColumnConfigsService],
  exports: [ColumnConfigsService]
})
export class ColumnConfigsModule {}
