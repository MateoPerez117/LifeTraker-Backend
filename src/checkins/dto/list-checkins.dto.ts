import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ListCheckinsDto {
  @IsString()
  goalId!: string;

  @IsOptional() @IsDateString() 
  from?: string;

  @IsOptional() @IsDateString() 
  to?: string;
}
