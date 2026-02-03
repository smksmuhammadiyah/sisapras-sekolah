import { Module } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { YearsModule } from '../years/years.module';

@Module({
  imports: [PrismaModule, YearsModule],
  providers: [ProcurementService],
  controllers: [ProcurementController],
})
export class ProcurementModule { }
