// src/streaks/dto/record-streak-checkin.dto.ts
import { IsDateString, IsOptional } from 'class-validator';
export class RecordStreakCheckinDto {
  @IsDateString() date!: string; // ISO; se normaliza a 00:00:00 UTC
  @IsOptional() metadata?: any;
  @IsOptional() done?: boolean; // por si quieres forzar false/true
}
