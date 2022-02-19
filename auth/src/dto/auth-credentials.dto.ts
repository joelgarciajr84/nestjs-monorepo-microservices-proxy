import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {PASSWORD_VALIDATOR, USERNAME_VALIDATOR } from '../auth-credentials.enum';
export class AuthCrendentialsDto {
    @ApiProperty()
    @IsString()
    @MinLength(USERNAME_VALIDATOR.MIN_LENGTH)
    @MaxLength(USERNAME_VALIDATOR.MAX_LENGTH)
    public username: string;

    @ApiProperty()
    @IsString()
    @MinLength(PASSWORD_VALIDATOR.MIN_LENGTH)
    @MaxLength(PASSWORD_VALIDATOR.MAX_LENGTH)
    public password: string;
}
