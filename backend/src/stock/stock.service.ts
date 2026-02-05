import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YearsService } from '../years/years.service';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { StockTransactionType } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private yearsService: YearsService,
  ) {}

  async createItem(createStockItemDto: CreateStockItemDto) {
    return this.prisma.stockItem.create({
      data: createStockItemDto,
    });
  }

  async findAllItems() {
    return this.prisma.stockItem.findMany();
  }

  async findOneItem(id: string) {
    return this.prisma.stockItem.findUnique({
      where: { id },
      include: { transactions: true },
    });
  }

  async createTransaction(
    stockItemId: string,
    userId: string,
    createDto: CreateStockTransactionDto,
  ) {
    const item = await this.prisma.stockItem.findUnique({
      where: { id: stockItemId },
    });

    if (!item) {
      throw new BadRequestException('Stock item not found');
    }

    const activeYear = await this.yearsService.getActiveYear();

    let newQuantity = item.quantity;
    if (createDto.type === StockTransactionType.IN) {
      newQuantity += createDto.quantity;
    } else {
      if (item.quantity < createDto.quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      newQuantity -= createDto.quantity;
    }

    // Transactional update
    return this.prisma.$transaction([
      this.prisma.stockTransaction.create({
        data: {
          stockItemId,
          userId,
          type: createDto.type,
          quantity: createDto.quantity,
          notes: createDto.notes,
          academicYearId: activeYear?.id,
        },
      }),
      this.prisma.stockItem.update({
        where: { id: stockItemId },
        data: { quantity: newQuantity },
      }),
    ]);
  }

  async deleteItem(id: string) {
    // Delete all transactions first (cascade), then item
    await this.prisma.stockTransaction.deleteMany({
      where: { stockItemId: id },
    });
    return this.prisma.stockItem.delete({
      where: { id },
    });
  }
}
