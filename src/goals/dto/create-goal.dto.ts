import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { GoalTargetType } from '@prisma/client';

export class CreateGoalDto {
  @IsString()
  @Length(1, 80)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsEnum(GoalTargetType)
  targetType!: GoalTargetType; // DAILY | WEEKLY | COUNT | BOOLEAN

  @IsOptional()
  @IsInt()
  @Min(1)
  targetValue?: number | null; // requerido si COUNT/WEEKLY

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  // Solo para pruebas si no mandas header (lo puedes borrar luego):
  @IsOptional()
  @IsString()
  userId?: string;
}
