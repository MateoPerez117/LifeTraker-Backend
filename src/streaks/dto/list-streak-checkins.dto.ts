import { IsDateString, IsOptional } from 'class-validator';
export class ListStreakCheckinsDto {
  @IsOptional() @IsDateString() 
  from?: string;
  @IsOptional() @IsDateString() 
  to?: string;
  @IsOptional() 
  memberId?: string; // opcional: filtrar x miembro
}