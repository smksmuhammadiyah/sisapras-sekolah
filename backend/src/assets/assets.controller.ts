import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('assets')
@UseGuards(AuthGuard('jwt'))
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }

  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Post('bulk')
  createBulk(@Body() items: CreateAssetDto[]) {
    return this.assetsService.createBulk(items);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.assetsService.findAll(query);
  }

  @Get('trash/all')
  findDeleted() {
    return this.assetsService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: any) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.assetsService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Delete(':id/permanent')
  permanentRemove(@Param('id') id: string) {
    return this.assetsService.permanentRemove(id);
  }

  @Get('export/report-data')
  getReportData(@Query() query: any) {
    return this.assetsService.findAllForReport(query);
  }
}
