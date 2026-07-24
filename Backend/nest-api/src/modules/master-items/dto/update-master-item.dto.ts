import { PartialType } from '@nestjs/mapped-types';
import { CreateMasterItemDto } from './create-master-item.dto';

export class UpdateMasterItemDto extends PartialType(CreateMasterItemDto) {}
