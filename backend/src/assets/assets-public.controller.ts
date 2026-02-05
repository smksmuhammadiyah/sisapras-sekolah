import { Controller, Get, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets/public')
export class AssetsPublicController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get(':id')
  findOnePublic(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }
}
