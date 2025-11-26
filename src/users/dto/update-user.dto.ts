// src/users/dto/update-user.dto.ts

import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  fullName?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Por favor, introduce una URL válida.' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Length(10, 300)
  bio?: string;
}