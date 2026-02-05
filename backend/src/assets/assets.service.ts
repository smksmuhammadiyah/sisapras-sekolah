import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) { }

  async create(createAssetDto: CreateAssetDto) {
    const purchaseDate = createAssetDto.purchaseDate ? new Date(createAssetDto.purchaseDate) : new Date();
    const purchaseYear = isNaN(purchaseDate.getFullYear()) ? new Date().getFullYear() : purchaseDate.getFullYear();
    const categoryName = createAssetDto.category || 'GEN';
    const code = await this.generateCode(categoryName, purchaseYear);


    try {
      return await this.prisma.asset.create({
        data: {
          ...createAssetDto,
          purchaseDate: new Date(createAssetDto.purchaseDate),
          purchaseYear,
          code,
        },
      });
    } catch (error) {
      console.error("Asset Create Error:", error);
      throw new BadRequestException("Asset Create Failed: " + error.message);
    }
  }

  async createBulk(items: CreateAssetDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const results: any[] = [];
      for (const item of items) {
        const purchaseYear = new Date(item.purchaseDate).getFullYear();
        const catCode = item.category.substring(0, 4).toUpperCase();

        const count = await tx.asset.count({
          where: { purchaseYear, category: item.category },
        });

        const seq = (count + 1).toString().padStart(3, '0');
        const code = `SMK/${catCode}/${purchaseYear}/${seq}`;

        const created = await tx.asset.create({
          data: {
            ...item,
            purchaseDate: new Date(item.purchaseDate),
            purchaseYear,
            code,
          },
        });
        results.push(created);
      }
      return results;
    }, { timeout: 20000 });
  }

  async findAll() {
    return this.prisma.asset.findMany({
      where: { deletedAt: null },
      include: { room: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include: { room: true, auditItems: true },
    });
  }

  async remove(id: string) {
    return this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.asset.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async findDeleted() {
    return this.prisma.asset.findMany({
      where: { deletedAt: { not: null } },
      include: { room: true },
    });
  }

  async permanentRemove(id: string) {
    return this.prisma.asset.delete({
      where: { id },
    });
  }

  private async generateCode(category: string, year: number): Promise<string> {
    // Format: SMK/{CATEGORY}/{YEAR}/{SEQ}
    // Example: SMK/ELEC/2026/001
    // Simplify category to 3-4 chars uppercase
    const catCode = category.substring(0, 4).toUpperCase();

    const count = await this.prisma.asset.count({
      where: {
        purchaseYear: year,
        category: category,
      },
    });

    const seq = (count + 1).toString().padStart(3, '0');
    return `SMK/${catCode}/${year}/${seq}`;
  }
}
