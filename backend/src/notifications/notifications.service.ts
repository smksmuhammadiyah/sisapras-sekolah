import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) { }

  async getSummary() {
    const lowStockCount = await this.prisma.stockItem.count({
      where: {
        quantity: {
          lte: this.prisma.stockItem.fields.minStock,
        },
      },
    });

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
