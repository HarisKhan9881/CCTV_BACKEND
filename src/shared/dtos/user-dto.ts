import {IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator";

export class UserDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    firstName: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(100)
    emailAddress: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    userPassword: string;

    @IsNotEmpty()
    @IsInt()
    roleId: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    createdBy: string;
}
