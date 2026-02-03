import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ProcurementPriority, ProcurementStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProcurementItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  spec?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  priceEst: number;
}

export class CreateProcurementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProcurementPriority)
  priority: ProcurementPriority;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProcurementItemDto)
  items: CreateProcurementItemDto[];
}
