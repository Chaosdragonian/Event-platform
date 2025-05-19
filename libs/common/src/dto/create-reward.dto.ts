import { IsMongoId, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateRewardDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId: string;
  @IsNotEmpty()
  @IsString()
  type: string;
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
