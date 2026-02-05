import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { AuthGuard } from '@nestjs/passport';

import { Request as ExpressRequest } from 'express';
import { Role } from '@prisma/client';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    id: string;
    username: string;
    role: Role;
  };
}

@Controller('services')
@UseGuards(AuthGuard('jwt'))
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(
      req.user.userId || req.user.id,
      createServiceDto,
    );
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }
}
