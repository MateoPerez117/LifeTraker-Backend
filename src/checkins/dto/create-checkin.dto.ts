import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator"

export class CreateCheckinDto {
    @IsString()
    goalId!: string

    @IsDateString()
    date!:string

    @IsOptional()
    @IsInt()
    @Min(1)
    value?:number

    @IsOptional()
    @IsBoolean()
    done?:boolean
}
