import { IsString } from 'class-validator';

export class CreateDmRoomDto {
  @IsString()
  otherUserId!: string;
}
