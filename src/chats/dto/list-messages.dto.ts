import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class ListMessagesDto {
  @IsOptional()
  @IsString()
  cursor?: string; // id del último mensaje visto (para paginación hacia atrás)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number; // por defecto 50
}
