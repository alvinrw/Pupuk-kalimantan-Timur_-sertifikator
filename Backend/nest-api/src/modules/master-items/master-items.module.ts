import { Module } from '@nestjs/common';
import { MasterItemsController } from './master-items.controller';
import { MasterItemsService } from './master-items.service';

import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MasterItemsController],
  providers: [MasterItemsService]
})
export class MasterItemsModule {}
