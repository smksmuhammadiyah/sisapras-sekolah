import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLendingDto } from './dto/create-lending.dto';
import { LendingStatus } from '@prisma/client';

@Injectable()
export class LendingService {
  constructor(private prisma: PrismaService) { }

  async create(createLendingDto: CreateLendingDto) {
    return this.prisma.lending.create({
      data: {
        assetId: createLendingDto.assetId,
        borrowerId: createLendingDto.borrowerId,
        borrowerName: createLendingDto.borrowerName,
        conditionBefore: createLendingDto.conditionBefore,
        notes: createLendingDto.notes,
      },
      include: { asset: true, borrower: true },
    });
  }

  async findAll() {
    return this.prisma.lending.findMany({
      include: { asset: true, borrower: true },
      orderBy: { borrowDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.lending.findUnique({
      where: { id },
      include: { asset: true, borrower: true },
    });
  }

  async returnItem(id: string, conditionAfter: string) {
    return this.prisma.lending.update({
      where: { id },
      data: {
        status: LendingStatus.RETURNED,
        returnDate: new Date(),
        conditionAfter,
      },
    });
  }

  async findByAsset(assetId: string) {
    return this.prisma.lending.findMany({
      where: { assetId },
      include: { borrower: true },
      orderBy: { borrowDate: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.lending.delete({
      where: { id },
    });
  }

  async findAllForReport() {
    return this.prisma.lending.findMany({
      include: {
        asset: true,
        borrower: true,
      },
      orderBy: { borrowDate: 'desc' },
    });
  }
}
