import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ComplianceEventType, Transaction } from '@prisma/client';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async logSale(transaction: Transaction, userId: string) {
    return this.prisma.complianceLog.create({
      data: {
        eventType: ComplianceEventType.SALE,
        userId,
        entityType: 'transaction',
        entityId: transaction.id,
        action: `Sale completed - Transaction #${transaction.transactionNumber}`,
        afterState: {
          total: transaction.total,
          paymentMethod: transaction.paymentMethod,
          customerId: transaction.customerId,
        },
      },
    });
  }

  async logRefund(transaction: Transaction, userId: string) {
    return this.prisma.complianceLog.create({
      data: {
        eventType: ComplianceEventType.RETURN,
        userId,
        entityType: 'transaction',
        entityId: transaction.id,
        action: `Transaction refunded - Transaction #${transaction.transactionNumber}`,
        beforeState: {
          paymentStatus: 'COMPLETED',
        },
        afterState: {
          paymentStatus: 'REFUNDED',
        },
      },
    });
  }

  async logInventoryAdjustment(productId: string, before: number, after: number, userId: string, reason: string) {
    return this.prisma.complianceLog.create({
      data: {
        eventType: ComplianceEventType.INVENTORY_ADJUSTMENT,
        userId,
        entityType: 'inventory',
        entityId: productId,
        action: reason,
        beforeState: { quantity: before },
        afterState: { quantity: after },
      },
    });
  }

  async getAllLogs(paginationDto: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.complianceLog.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.complianceLog.count(),
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

  async getLogsByType(eventType: ComplianceEventType, paginationDto: PaginationDto) {
    const { page = 1, limit = 50 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.complianceLog.findMany({
        where: { eventType },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.complianceLog.count({ where: { eventType } }),
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

  async exportComplianceReport(startDate: Date, endDate: Date) {
    const logs = await this.prisma.complianceLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      reportDate: new Date().toISOString(),
      period: { startDate, endDate },
      totalEvents: logs.length,
      events: logs,
    };
  }

  // Mock METRC sync - replace with actual API integration
  async syncToMETRC(batchId: string) {
    // This would integrate with actual METRC API
    return this.prisma.complianceLog.create({
      data: {
        eventType: ComplianceEventType.METRC_SYNC,
        metrcBatchId: batchId,
        action: `Synced batch ${batchId} to METRC`,
        afterState: {
          syncedAt: new Date().toISOString(),
          status: 'success',
        },
      },
    });
  }
}
