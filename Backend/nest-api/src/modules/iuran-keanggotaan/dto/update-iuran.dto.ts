import { PartialType } from '@nestjs/mapped-types';
import { CreateIuranDto } from './create-iuran.dto';

export class UpdateIuranDto extends PartialType(CreateIuranDto) {}
