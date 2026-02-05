import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    // Prisma doesn't support column-to-column comparison in where clause directly
    // So we use raw query
    const lowStockResult = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::int as count FROM "StockItem" WHERE quantity <= "minStock"
    `;
    const lowStockCount = Number(lowStockResult[0]?.count || 0);

    const pendingProcurementsCount = await this.prisma.procurement.count({
      where: {
        status: 'PENDING',
      },
    });

    return {
      lowStock: lowStockCount,
      pendingProcurements: pendingProcurementsCount,
      total: lowStockCount + pendingProcurementsCount,
    };
  }
}
