import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.debug('Running daily cleanup job...');

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const deletedAssets = await this.prisma.asset.deleteMany({
      where: {
        deletedAt: {
          lt: threeDaysAgo,
        },
      },
    });

    const deletedRooms = await this.prisma.room.deleteMany({
      where: {
        deletedAt: {
          lt: threeDaysAgo,
        },
      },
    });

    const deletedProcurements = await this.prisma.procurement.deleteMany({
      where: {
        deletedAt: {
          lt: threeDaysAgo,
        },
      },
    });

    this.logger.log(
      `Cleanup complete. Deleted Assets: ${deletedAssets.count}, Rooms: ${deletedRooms.count}, Procurements: ${deletedProcurements.count}`,
    );
  }
}
