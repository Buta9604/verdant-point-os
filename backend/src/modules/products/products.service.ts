import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'product:';

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = await this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
        supplier: true,
      },
    });

    // Cache the product
    await this.cacheProduct(product);

    return product;
  }

  async findAll(paginationDto: PaginationDto, filterDto?: ProductFilterDto): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto?.categoryId) {
      where.categoryId = filterDto.categoryId;
    }

    if (filterDto?.isActive !== undefined) {
      where.isActive = filterDto.isActive;
    }

    if (filterDto?.search) {
      where.OR = [
        { name: { contains: filterDto.search, mode: 'insensitive' } },
        { sku: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          supplier: true,
          inventory: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    // Try cache first
    const cached = await this.redis.get(`${this.CACHE_PREFIX}${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Cache the product
    await this.cacheProduct(product);

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    return this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });

    // Update cache
    await this.cacheProduct(product);

    return product;
  }

  async remove(id: string): Promise<Product> {
    await this.findOne(id);

    const product = await this.prisma.product.delete({
      where: { id },
    });

    // Remove from cache
    await this.redis.del(`${this.CACHE_PREFIX}${id}`);

    return product;
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { categoryId, isActive: true },
      include: {
        inventory: true,
      },
    });
  }

  private async cacheProduct(product: Product): Promise<void> {
    await this.redis.set(
      `${this.CACHE_PREFIX}${product.id}`,
      JSON.stringify(product),
      this.CACHE_TTL,
    );
  }
}
