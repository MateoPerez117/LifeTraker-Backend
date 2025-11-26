import { IsBooleanString, IsOptional } from 'class-validator';

export class ListNotificationsDto {
  @IsOptional()
  @IsBooleanString()
  unread?: string; 
}
