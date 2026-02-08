import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) { }

  async getSummary(role: string) {
    const isAdmin = role === 'ADMIN';

    // Only Admin gets these counts
    let lowStockCount = 0;
    let pendingProcurementsCount = 0;
    let unapprovedUsersCount = 0;
    let activeLendingsCount = 0;

    if (isAdmin) {
      // 1. Low Stock
      const lowStockResult = await this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::int as count FROM "StockItem" WHERE quantity <= "minStock"
      `;
      lowStockCount = Number(lowStockResult[0]?.count || 0);

      // 2. Pending Procurements
      pendingProcurementsCount = await this.prisma.procurement.count({
        where: {
          status: 'PENDING',
        },
      });

      // 3. Unapproved Users
      unapprovedUsersCount = await this.prisma.user.count({
        where: {
          isApproved: false,
        },
      });

      // 4. Active Lendings (All borrowed items for admin to monitor)
      activeLendingsCount = await this.prisma.lending.count({
        where: {
          status: 'BORROWED',
        },
      });
    }

    return {
      lowStock: lowStockCount,
      pendingProcurements: pendingProcurementsCount,
      unapprovedUsers: unapprovedUsersCount,
      activeLendings: activeLendingsCount,
      total: lowStockCount + pendingProcurementsCount + unapprovedUsersCount + activeLendingsCount,
    };
  }
}
