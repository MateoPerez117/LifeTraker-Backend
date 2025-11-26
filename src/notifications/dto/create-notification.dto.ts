// src/notifications/dto/create-notification.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  type!: string; 

  @IsOptional()
  payload?: any; 
}
