import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { YearsService } from './years.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('years')
export class YearsController {
  constructor(private readonly yearsService: YearsService) { }

  @Get()
  findAll() {
    return this.yearsService.findAll();
  }

  @Get('active')
  getActive() {
    return this.yearsService.getActiveYear();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() data: { name: string; startDate: string; endDate: string }) {
    return this.yearsService.create(data);
  }

  @Patch(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  setActive(@Param('id') id: string) {
    return this.yearsService.setActive(id);
  }
}
