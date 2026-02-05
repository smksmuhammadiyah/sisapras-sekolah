import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LendingService } from './lending.service';
import { CreateLendingDto } from './dto/create-lending.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('lending')
@UseGuards(AuthGuard('jwt'))
export class LendingController {
  constructor(private readonly lendingService: LendingService) {}

  @Post()
  create(@Body() createLendingDto: CreateLendingDto) {
    return this.lendingService.create(createLendingDto);
  }

  @Get()
  findAll() {
    return this.lendingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lendingService.findOne(id);
  }

  @Get('asset/:assetId')
  findByAsset(@Param('assetId') assetId: string) {
    return this.lendingService.findByAsset(assetId);
  }

  @Patch(':id/return')
  returnItem(
    @Param('id') id: string,
    @Body('conditionAfter') conditionAfter: string,
  ) {
    return this.lendingService.returnItem(id, conditionAfter);
  }
}
