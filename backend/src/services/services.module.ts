import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { YearsModule } from '../years/years.module';

@Module({
  imports: [PrismaModule, YearsModule],
  providers: [ServicesService],
  controllers: [ServicesController],
})
export class ServicesModule { }
