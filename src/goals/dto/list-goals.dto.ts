import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class ListGoalsDto {
  @IsOptional()
  @IsBooleanString()
  archived?: 'true' | 'false';

  @IsOptional()
  @IsString()
  q?: string;
}
