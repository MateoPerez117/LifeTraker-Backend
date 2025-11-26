import { IsDateString, IsOptional } from 'class-validator';

export class GoalRangeDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
