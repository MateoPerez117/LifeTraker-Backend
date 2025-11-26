import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListRankingsDto {
  @IsString()
  period!: string; 

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number; 
}
