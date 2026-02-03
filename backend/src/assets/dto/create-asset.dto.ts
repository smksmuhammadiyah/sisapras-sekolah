import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { AssetCondition } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  spec?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsNotEmpty()
  purchaseDate: string; // ISO Date String

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition;

  @IsBoolean()
  @IsOptional()
  isWhiteListed?: boolean;

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsString()
  @IsOptional()
  managedById?: string;
}
