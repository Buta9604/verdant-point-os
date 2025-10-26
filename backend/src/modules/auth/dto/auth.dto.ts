import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches, Length } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class PinLoginDto {
  @IsString()
  @Length(4, 6)
  @Matches(/^[0-9]+$/, { message: 'PIN must contain only numbers' })
  pin: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(4, 6)
  @Matches(/^[0-9]+$/, { message: 'PIN must contain only numbers' })
  pin?: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
