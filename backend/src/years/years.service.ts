import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class YearsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async getActiveYear() {
    return this.prisma.academicYear.findFirst({
      where: { isActive: true },
    });
  }

  async create(data: { name: string; startDate: string; endDate: string }) {
    // Check if name exists
    const exists = await this.prisma.academicYear.findFirst({
      where: { name: data.name },
    });
    if (exists) throw new BadRequestException('Tahun ajaran sudah ada');

    // If first year, make it active
    const count = await this.prisma.academicYear.count();

    return this.prisma.academicYear.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: count === 0,
      },
    });
  }

  async setActive(id: string) {
    // Transaction: set all false, set one true
    return this.prisma.$transaction([
      this.prisma.academicYear.updateMany({ data: { isActive: false } }),
      this.prisma.academicYear.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);
  }
}
