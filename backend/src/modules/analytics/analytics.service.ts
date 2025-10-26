import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Cron } from '@nestjs/schedule';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(startDate?: Date, endDate?: Date) {
    const dateFilter = {
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [transactions, totalRevenue, uniqueCustomers, topProducts, topEmployees] = await Promise.all([
      this.prisma.transaction.count({
        where: {
          ...dateFilter,
          paymentStatus: PaymentStatus.COMPLETED,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...dateFilter,
          paymentStatus: PaymentStatus.COMPLETED,
        },
        _sum: {
          total: true,
        },
      }),
      this.prisma.transaction.findMany({
        where: {
          ...dateFilter,
          paymentStatus: PaymentStatus.COMPLETED,
        },
        select: {
          customerId: true,
        },
        distinct: ['customerId'],
      }),
      this.getTopProducts(5, startDate, endDate),
      this.getTopEmployees(5, startDate, endDate),
    ]);

    const avgBasketSize = transactions > 0
      ? (totalRevenue._sum.total?.toNumber() || 0) / transactions
      : 0;

    return {
      totalTransactions: transactions,
      totalRevenue: totalRevenue._sum.total?.toNumber() || 0,
      avgBasketSize,
      uniqueCustomers: uniqueCustomers.length,
      topProducts,
      topEmployees,
    };
  }

  async getTopProducts(limit: number = 10, startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      transaction: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: PaymentStatus.COMPLETED,
      },
    } : {};

    const items = await this.prisma.transactionItem.groupBy({
      by: ['productId'],
      where: dateFilter,
      _sum: {
        quantity: true,
        total: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          product,
          totalSold: item._sum.quantity || 0,
          totalRevenue: item._sum.total?.toNumber() || 0,
          transactionCount: item._count.productId,
        };
      }),
    );

    return productsWithDetails;
  }

  async getTopEmployees(limit: number = 10, startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    } : {};

    const transactions = await this.prisma.transaction.groupBy({
      by: ['userId'],
      where: {
        ...dateFilter,
        paymentStatus: PaymentStatus.COMPLETED,
      },
      _sum: {
        total: true,
      },
      _count: {
        userId: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: limit,
    });

    const employeesWithDetails = await Promise.all(
      transactions.map(async (txn) => {
        const user = await this.prisma.user.findUnique({
          where: { id: txn.userId },
        });
        return {
          user,
          totalSales: txn._sum.total?.toNumber() || 0,
          transactionCount: txn._count.userId,
        };
      }),
    );

    return employeesWithDetails.filter(e => e.user !== null);
  }

  async getSalesOverTime(startDate: Date, endDate: Date, interval: 'day' | 'week' | 'month' = 'day') {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: PaymentStatus.COMPLETED,
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    // Group by interval
    const grouped = transactions.reduce((acc, txn) => {
      const date = txn.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, count: 0 };
      }
      acc[date].total += txn.total.toNumber();
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
    }));
  }

  @Cron('0 0 * * *') // Run daily at midnight
  async aggregateDailyAnalytics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const stats = await this.getDashboardStats(yesterday, endOfYesterday);
    const topProduct = stats.topProducts[0];
    const topEmployee = stats.topEmployees[0];

    await this.prisma.analyticsSummary.create({
      data: {
        date: yesterday,
        totalSales: stats.totalTransactions,
        totalRevenue: stats.totalRevenue,
        avgBasketSize: stats.avgBasketSize,
        uniqueCustomers: stats.uniqueCustomers,
        topProductId: topProduct?.product?.id,
        topEmployeeId: topEmployee?.user?.id,
      },
    });
  }
}
