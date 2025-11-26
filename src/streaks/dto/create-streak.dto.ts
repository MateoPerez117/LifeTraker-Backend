import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateStreakDto {
  @IsString() 
  title!: string;

  @IsOptional()
  @IsString() 
  description?: string;

  @IsDateString() 
  startDate!: string; 

  @IsOptional() 
  @IsDateString() 
  endDate?: string;
}
