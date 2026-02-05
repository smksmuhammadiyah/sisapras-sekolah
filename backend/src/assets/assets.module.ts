import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AssetsPublicController } from './assets-public.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AssetsService],
  controllers: [AssetsController, AssetsPublicController],
})
export class AssetsModule { }

