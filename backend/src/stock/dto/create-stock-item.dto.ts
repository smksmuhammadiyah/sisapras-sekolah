import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateStockItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsString()
  @IsOptional()
  spec?: string;

  @IsInt()
  @IsOptional()
  minStock?: number;
}
