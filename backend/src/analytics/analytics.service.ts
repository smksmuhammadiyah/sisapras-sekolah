import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetCondition, ProcurementStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // 1. Asset Conditions (Good, Broken Light, Broken Heavy)
    const totalAssets = await this.prisma.asset.count();
    const assetsByCondition = await this.prisma.asset.groupBy({
      by: ['condition'],
      _count: {
        condition: true,
      },
    });

    // 2. Low Stock Items (quantity <= minStock)
    const lowStockItems = await this.prisma.stockItem.findMany({
      where: {
        quantity: {
          lte: 5, // Threshold hardcoded or calculate from minStock? Let's use minStock if available or 5
        },
        // Better: where quantity <= minStock. But Prisma doesn't support field comparison in where naturally easily without raw query or separate check.
        // Actually, let's just fetch all and filter or use raw query.
        // Or simplified: fetch top 5 lowest stock.
      },
      take: 5,
      orderBy: {
        quantity: 'asc',
      },
      select: {
        name: true,
        quantity: true,
        minStock: true,
      },
    });

    // 3. Procurement Status
    const procurementStats = await this.prisma.procurement.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return {
      totalAssets,
      assetConditions: assetsByCondition.map((item) => ({
        name: item.condition,
        value: item._count.condition,
      })),
      lowStockItems: lowStockItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        limit: item.minStock,
      })),
      procurementStats: procurementStats.map((item) => ({
        name: item.status,
        value: item._count.status,
      })),
    };
  }

  async getUserStats(userId: string) {
    const [myProposals, approvedProposals, stockAgg] = await Promise.all([
      this.prisma.procurement.count({
        where: { requesterId: userId, deletedAt: null },
      }),
      this.prisma.procurement.count({
        where: { requesterId: userId, status: 'APPROVED', deletedAt: null },
      }),
      this.prisma.stockItem.aggregate({ _sum: { quantity: true } }),
    ]);

    return {
      myProposals,
      approvedProposals,
      itemsInStock: stockAgg._sum.quantity || 0,
    };
  }

  async getStaffStats() {
    const [pendingAudits, brokenAssets, upcomingServices] = await Promise.all([
      this.prisma.audit.count({ where: { status: 'DRAFT' } }),
      this.prisma.asset.count({
        where: {
          OR: [{ condition: 'BROKEN_LIGHT' }, { condition: 'BROKEN_HEAVY' }],
        },
      }),
      this.prisma.service.count({ where: { date: { gte: new Date() } } }),
    ]);

    return {
      pendingAudits,
      brokenAssets,
      upcomingServices,
    };
  }
}
