import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { Customer } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Customer>> {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.customer.count(),
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

  async findOne(id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string): Promise<Customer> {
    await this.findOne(id);

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async updateAfterPurchase(id: string, amount: number): Promise<void> {
    const customer = await this.findOne(id);
    const loyaltyPoints = Math.floor(amount * 0.05); // 5% points

    await this.prisma.customer.update({
      where: { id },
      data: {
        totalSpent: customer.totalSpent.toNumber() + amount,
        visitCount: customer.visitCount + 1,
        loyaltyPoints: customer.loyaltyPoints + loyaltyPoints,
      },
    });
  }

  async updateAfterRefund(id: string, amount: number): Promise<void> {
    const customer = await this.findOne(id);
    const loyaltyPoints = Math.floor(amount * 0.05);

    await this.prisma.customer.update({
      where: { id },
      data: {
        totalSpent: Math.max(0, customer.totalSpent.toNumber() - amount),
        loyaltyPoints: Math.max(0, customer.loyaltyPoints - loyaltyPoints),
      },
    });
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
      },
      take: 20,
    });
  }
}
