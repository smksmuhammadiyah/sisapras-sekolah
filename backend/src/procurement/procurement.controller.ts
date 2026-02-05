import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('procurements')
@UseGuards(AuthGuard('jwt'))
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateProcurementDto) {
    return this.procurementService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.procurementService.findAll(req.user.userId, req.user.role);
  }

  @Get('trash/all')
  findDeleted() {
    return this.procurementService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.procurementService.findOne(id);
  }

  @Patch(':id/approve')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.procurementService.approve(id, req.user.role);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.procurementService.reject(id, reason);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.procurementService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.procurementService.remove(id);
  }
}
