import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YearsService } from '../years/years.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { ProcurementStatus, Role } from '@prisma/client';

import { MailService } from '../mail/mail.service';

@Injectable()
export class ProcurementService {
  constructor(
    private prisma: PrismaService,
    private yearsService: YearsService,
    private mailService: MailService
  ) { }

  async create(requesterId: string, dto: CreateProcurementDto) {
    const activeYear = await this.yearsService.getActiveYear();

    const totalBudget = dto.items.reduce(
      (sum, item) => sum + item.priceEst * item.quantity,
      0,
    );

    return this.prisma.procurement.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        totalBudget,
        status: ProcurementStatus.PENDING,
        academicYearId: activeYear?.id,
        requesterId,
        items: {
          create: dto.items.map((item) => ({
            name: item.name,
            spec: item.spec,
            quantity: item.quantity,
            priceEst: item.priceEst,
            totalEst: item.priceEst * item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll(userId?: string, role?: string) {
    // If user is not ADMIN or STAFF, only show their own procurements
    const where: any = { deletedAt: null };

    if (role && role !== 'ADMIN' && role !== 'STAFF') {
      where.requesterId = userId;
    }

    return this.prisma.procurement.findMany({
      where,
      include: { requester: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.procurement.findFirst({
      where: { id, deletedAt: null },
      include: { requester: true, items: true },
    });
  }

  async remove(id: string) {
    return this.prisma.procurement.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.procurement.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async findDeleted() {
    return this.prisma.procurement.findMany({
      where: { deletedAt: { not: null } },
      include: { requester: true, items: true },
    });
  }

  async approve(id: string, userRole: Role) {
    const procurement = await this.prisma.procurement.findUnique({ where: { id } });
    if (!procurement) throw new BadRequestException('Procurement not found');

    let nextStatus: ProcurementStatus = ProcurementStatus.APPROVED;

    if (userRole === Role.KAPROG) {
      if (procurement.status !== ProcurementStatus.PENDING) {
        throw new BadRequestException('KAPROG can only approve PENDING items');
      }
      nextStatus = ProcurementStatus.REVIEW_WAKASEK;
    } else if (userRole === Role.ADMIN) {
      nextStatus = ProcurementStatus.APPROVED;
    } else {
      throw new BadRequestException('Unauthorized role for approval');
    }

    const updated = await this.prisma.procurement.update({
      where: { id },
      data: { status: nextStatus },
      include: { requester: true },
    });

    if (updated.requester?.email) {
      this.mailService.sendProcurementNotification(updated.requester.email, updated.title, updated.status);
    }

    return updated;
  }

  async reject(id: string, reason: string) {
    const updated = await this.prisma.procurement.update({
      where: { id },
      data: { status: ProcurementStatus.REJECTED, rejectionReason: reason },
      include: { requester: true }
    });

    if (updated.requester?.email) {
      this.mailService.sendProcurementNotification(updated.requester.email, updated.title, updated.status, reason);
    }

    return updated;
  }
}
