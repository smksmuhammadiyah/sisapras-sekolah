import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YearsService } from '../years/years.service';
import { CreateAuditDto } from './dto/create-audit.dto';

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private yearsService: YearsService,
  ) { }

  async create(auditorId: string, createAuditDto: CreateAuditDto) {
    const activeYear = await this.yearsService.getActiveYear();

    return this.prisma.audit.create({
      data: {
        auditorId,
        status: createAuditDto.status || 'DRAFT',
        academicYearId: activeYear?.id,
        items: {
          create: createAuditDto.items.map((item) => ({
            assetId: item.assetId,
            condition: item.condition,
            note: item.note,
            evidencePhotoUrl: item.evidencePhotoUrl,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findAll() {
    return this.prisma.audit.findMany({
      include: { auditor: true, items: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.audit.findUnique({
      where: { id },
      include: { auditor: true, items: { include: { asset: true } } },
    });
  }

  async remove(id: string) {
    // Delete audit items first (Prisma doesn't necessarily cascade if not configured)
    await this.prisma.auditItem.deleteMany({
      where: { auditId: id },
    });
    return this.prisma.audit.delete({
      where: { id },
    });
  }
}
