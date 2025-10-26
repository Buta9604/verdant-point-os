import { IsEmail, IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { PreferredContact } from '@prisma/client';

export class CreateCustomerDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  medicalCardNumber?: string;

  @IsOptional()
  @IsDateString()
  medicalCardExpiry?: string;

  @IsOptional()
  @IsString()
  medicalCardState?: string;

  @IsOptional()
  @IsEnum(PreferredContact)
  preferredContact?: PreferredContact;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  medicalCardNumber?: string;

  @IsOptional()
  @IsDateString()
  medicalCardExpiry?: string;

  @IsOptional()
  @IsString()
  medicalCardState?: string;

  @IsOptional()
  @IsEnum(PreferredContact)
  preferredContact?: PreferredContact;

  @IsOptional()
  @IsString()
  notes?: string;
}
