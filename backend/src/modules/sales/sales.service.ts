import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTransactionDto, TransactionFilterDto } from './dto/sale.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { Transaction, PaymentStatus } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { CustomersService } from '../customers/customers.service';
import { ComplianceService } from '../compliance/compliance.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private customersService: CustomersService,
    private complianceService: ComplianceService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<Transaction> {
    const { items, customerId, paymentMethod, discountAmount = 0, registerId, notes } = createTransactionDto;

    // Validate inventory for all items
    for (const item of items) {
      const inventory = await this.inventoryService.findByProductId(item.productId);
      if (inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient inventory for product ${item.productId}. Available: ${inventory.quantity}`,
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const itemsWithPrices = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });

      const itemSubtotal = product.price.toNumber() * item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTotal = itemSubtotal - itemDiscount;

      subtotal += itemTotal;

      itemsWithPrices.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        discount: itemDiscount,
        total: itemTotal,
        taxRate: product.category.taxRate,
      });
    }

    // Calculate tax (average tax rate across items)
    const taxAmount = itemsWithPrices.reduce((acc, item) => {
      return acc + (item.total * item.taxRate.toNumber() / 100);
    }, 0);

    const total = subtotal + taxAmount - discountAmount;

    // Generate transaction number
    const transactionNumber = await this.generateTransactionNumber();

    // Create transaction in a transaction
    const transaction = await this.prisma.$transaction(async (tx) => {
      // Create transaction
      const newTransaction = await tx.transaction.create({
        data: {
          transactionNumber,
          customerId,
          userId,
          subtotal,
          taxAmount,
          discountAmount,
          total,
          paymentMethod,
          registerId,
          notes,
          items: {
            create: itemsWithPrices.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              total: item.total,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          user: true,
        },
      });

      // Update inventory
      for (const item of items) {
        await this.inventoryService.decreaseQuantity(item.productId, item.quantity);
      }

      // Update customer stats if applicable
      if (customerId) {
        await this.customersService.updateAfterPurchase(customerId, total);
      }

      return newTransaction;
    });

    // Log compliance event
    await this.complianceService.logSale(transaction, userId);

    return transaction;
  }

  async findAll(paginationDto: PaginationDto, filterDto?: TransactionFilterDto): Promise<PaginatedResult<Transaction>> {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto?.userId) {
      where.userId = filterDto.userId;
    }

    if (filterDto?.customerId) {
      where.customerId = filterDto.customerId;
    }

    if (filterDto?.paymentStatus) {
      where.paymentStatus = filterDto.paymentStatus;
    }

    if (filterDto?.startDate && filterDto?.endDate) {
      where.createdAt = {
        gte: new Date(filterDto.startDate),
        lte: new Date(filterDto.endDate),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          user: true,
        },
      }),
      this.prisma.transaction.count({ where }),
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

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        user: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async refund(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.paymentStatus === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Transaction already refunded');
    }

    // Refund in transaction
    const refundedTransaction = await this.prisma.$transaction(async (tx) => {
      // Update transaction status
      const updated = await tx.transaction.update({
        where: { id },
        data: { paymentStatus: PaymentStatus.REFUNDED },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          user: true,
        },
      });

      // Restore inventory
      for (const item of transaction.items) {
        await this.inventoryService.increaseQuantity(item.productId, item.quantity);
      }

      // Update customer stats if applicable
      if (transaction.customerId) {
        await this.customersService.updateAfterRefund(transaction.customerId, transaction.total.toNumber());
      }

      return updated;
    });

    // Log compliance event
    await this.complianceService.logRefund(refundedTransaction, userId);

    return refundedTransaction;
  }

  async getSalesSummary(startDate: Date, endDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: PaymentStatus.COMPLETED,
      },
      include: {
        items: true,
      },
    });

    const totalSales = transactions.reduce((acc, t) => acc + t.total.toNumber(), 0);
    const totalTransactions = transactions.length;
    const avgBasketSize = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    return {
      totalSales,
      totalTransactions,
      avgBasketSize,
      period: {
        startDate,
        endDate,
      },
    };
  }

  private async generateTransactionNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.transaction.count({
      where: {
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
        },
      },
    });
    return `TXN-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
}
