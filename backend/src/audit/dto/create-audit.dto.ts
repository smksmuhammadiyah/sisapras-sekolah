import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCondition, AuditStatus } from '@prisma/client';

export class CreateAuditItemDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsEnum(AssetCondition)
  condition: AssetCondition;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  evidencePhotoUrl?: string;
}

export class CreateAuditDto {
  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuditItemDto)
  items: CreateAuditItemDto[];
}
