import { Module } from '@nestjs/common';
import { MasterItemsController } from './master-items.controller';
import { MasterItemsService } from './master-items.service';

@Module({
  controllers: [MasterItemsController],
  providers: [MasterItemsService]
})
export class MasterItemsModule {}
