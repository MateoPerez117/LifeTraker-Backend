import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateActivityCategoryDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @IsHexColor()
  color?: string; 
}

