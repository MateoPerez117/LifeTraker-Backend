import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ComputeRankingDto {
  @IsString()
  @IsNotEmpty()
  period!: string; 

 
  @IsDateString()
  from!: string;   

  @IsDateString()
  to!: string;     
 
  @IsOptional()
  metadata?: any;

}
