import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YearsService } from '../years/years.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private yearsService: YearsService,
  ) { }

  async create(reportedById: string, createServiceDto: CreateServiceDto) {
    const activeYear = await this.yearsService.getActiveYear();

    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        reportedById,
        academicYearId: activeYear?.id,
      },
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      include: { asset: true, reportedBy: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: { asset: true, reportedBy: true },
    });
  }

  async findAllForReport() {
    return this.prisma.service.findMany({
      include: { asset: true, reportedBy: true, academicYear: true },
      orderBy: { date: 'desc' },
    });
  }
}
