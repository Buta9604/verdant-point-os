import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { Inventory } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    return this.prisma.inventory.create({
      data: createInventoryDto,
      include: {
        product: true,
      },
    });
  }

  async findAll(): Promise<Inventory[]> {
    return this.prisma.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async findByProductId(productId: string): Promise<Inventory> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }

    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    await this.findOne(id);

    return this.prisma.inventory.update({
      where: { id },
      data: updateInventoryDto,
      include: {
        product: true,
      },
    });
  }

  async increaseQuantity(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProductId(productId);

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: inventory.quantity + quantity,
        lastRestockDate: new Date(),
      },
    });
  }

  async decreaseQuantity(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProductId(productId);

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: inventory.quantity - quantity,
      },
    });
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return this.prisma.inventory.findMany({
      where: {
        quantity: {
          lte: this.prisma.inventory.fields.reorderLevel,
        },
      },
      include: {
        product: true,
      },
    });
  }

  async getExpiringItems(days: number = 30): Promise<Inventory[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.inventory.findMany({
      where: {
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        product: true,
      },
    });
  }
}
