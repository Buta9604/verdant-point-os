import { IsUUID, IsNumber, IsOptional, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reorderLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reorderQuantity?: number;

  @IsOptional()
  @IsDateString()
  lastRestockDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateInventoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reorderLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reorderQuantity?: number;

  @IsOptional()
  @IsDateString()
  lastRestockDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
