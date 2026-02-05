import { IsString, IsOptional } from 'class-validator';

export class CreateLendingDto {
  @IsString()
  assetId: string;

  @IsString()
  borrowerId: string;

  @IsString()
  borrowerName: string;

  @IsString()
  conditionBefore: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
