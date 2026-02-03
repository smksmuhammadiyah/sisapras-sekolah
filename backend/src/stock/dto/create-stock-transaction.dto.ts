import { IsString, IsNotEmpty, IsInt, IsEnum, IsOptional } from 'class-validator';
import { StockTransactionType } from '@prisma/client';

export class CreateStockTransactionDto {
  @IsEnum(StockTransactionType)
  type: StockTransactionType;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
