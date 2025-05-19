import { IsMongoId } from 'class-validator';

export class ClaimRewardDto {
  @IsMongoId() eventId: string;
}
