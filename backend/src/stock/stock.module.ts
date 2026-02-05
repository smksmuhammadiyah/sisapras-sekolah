import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { YearsModule } from '../years/years.module';

@Module({
  imports: [PrismaModule, YearsModule],
  providers: [StockService],
  controllers: [StockController],
})
export class StockModule {}
