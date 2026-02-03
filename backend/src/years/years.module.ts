import { Module } from '@nestjs/common';
import { YearsService } from './years.service';
import { YearsController } from './years.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [YearsController],
  providers: [YearsService],
  exports: [YearsService] // Export service so others can use it
})
export class YearsModule { }
