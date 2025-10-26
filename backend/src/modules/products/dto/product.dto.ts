import { IsString, IsUUID, IsEnum, IsDecimal, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { StrainType } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsEnum(StrainType)
  strainType?: StrainType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thcPercentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cbdPercentage?: number;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  metrcId?: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightGrams?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsEnum(StrainType)
  strainType?: StrainType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thcPercentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cbdPercentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightGrams?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProductFilterDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
