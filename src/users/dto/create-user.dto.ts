import { IsEmail, IsString, Length } from 'class-validator';


export class CreateUserDto {
    
    @IsEmail()
    email:string

    @IsString()
    @Length(3, 32)
    username: string;

    @IsString()
    @Length(8, 72)
    passwordHash: string;
}
