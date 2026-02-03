import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { YearsModule } from '../years/years.module';

@Module({
  imports: [PrismaModule, YearsModule],
  providers: [AuditService],
  controllers: [AuditController],
})
export class AuditModule { }
