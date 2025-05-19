import { IsOptional, IsMongoId, IsEnum } from 'class-validator';

export class ListClaimsDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  rewardId?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'REJECTED', 'APPROVED'])
  status?: 'PENDING' | 'REJECTED' | 'APPROVED';
}
