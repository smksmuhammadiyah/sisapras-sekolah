import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) { }

  async create(createAssetDto: CreateAssetDto) {
    const pDate = createAssetDto.purchaseDate ? new Date(createAssetDto.purchaseDate) : new Date();
    // Use year from DTO if explicitly provided (could be null for unknown), otherwise derive from date
    const pYear = (createAssetDto.purchaseYear !== undefined)
      ? createAssetDto.purchaseYear
      : (isNaN(pDate.getFullYear()) ? new Date().getFullYear() : pDate.getFullYear());

    const catName = createAssetDto.category || 'GEN';

    console.log(`[AssetsService] Creating asset: ${createAssetDto.name}, Category: ${catName}, Year: ${pYear}`);

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const generatedCode = await this.generateCode(catName, pYear);
        console.log(`[AssetsService] Generated code: ${generatedCode} (Attempt ${attempts + 1})`);

        // Create with explicit fields to avoid any DTO pollution
        const result = await this.prisma.asset.create({
          data: {
            name: createAssetDto.name,
            category: createAssetDto.category,
            spec: createAssetDto.spec,
            brand: createAssetDto.brand,
            origin: createAssetDto.origin,
            purchaseDate: pDate,
            purchaseYear: pYear,
            price: createAssetDto.price,
            condition: createAssetDto.condition || 'GOOD',
            roomId: createAssetDto.roomId || null,
            managedById: createAssetDto.managedById || null,
            imageUrl: createAssetDto.imageUrl,
            assetStatus: createAssetDto.assetStatus,
            notes: createAssetDto.notes,
            code: generatedCode,
          },
        });

        console.log(`[AssetsService] Asset created successfully. ID: ${result.id}, Code: ${result.code}`);
        return result;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          console.warn(`[AssetsService] P2002 Collision on attempt ${attempts + 1}. Target: ${error.meta?.target}`);
          attempts++;
          continue;
        }
        console.error('[AssetsService] Fatal Create Error:', error);
        throw new BadRequestException(`Gagal simpan: ${error.message || 'Error tidak dikenal'}`);
      }
    }

    throw new BadRequestException('Gagal membuat kode unik setelah beberapa kali percobaan. Silakan coba lagi.');
  }

  async createBulk(items: CreateAssetDto[]) {
    return this.prisma.$transaction(
      async (tx) => {
        const results: any[] = [];
        for (const item of items) {
          const pDate = item.purchaseDate
            ? new Date(item.purchaseDate)
            : new Date();

          // Respect explicit purchaseYear from DTO if present
          const purchaseYear = (item.purchaseYear !== undefined)
            ? item.purchaseYear
            : (isNaN(pDate.getFullYear()) ? new Date().getFullYear() : pDate.getFullYear());

          const categoryName = item.category || 'GEN';

          let code = '';
          let attempts = 0;
          const maxInnerAttempts = 3;

          while (attempts < maxInnerAttempts) {
            const catPrefix = categoryName.substring(0, 4).toUpperCase();
            const basePrefix = `SMK/${catPrefix}/${purchaseYear}/`;

            // Count including what's in the DB + what we've added in this transaction
            const dbCount = await tx.asset.count({
              where: { code: { startsWith: basePrefix } },
            });

            const currentCount = dbCount + results.filter(r => r.code.startsWith(basePrefix)).length;
            const seq = (currentCount + 1).toString().padStart(3, '0');
            const candidateCode = `${basePrefix}${seq}${attempts > 0 ? '-' + Math.random().toString(36).substring(2, 5).toUpperCase() : ''}`;

            const existingInTx = results.find(r => r.code === candidateCode);
            if (!existingInTx) {
              code = candidateCode;
              break;
            }
            attempts++;
          }

          const created = await tx.asset.create({
            data: {
              ...item,
              purchaseDate: pDate,
              purchaseYear,
              roomId: item.roomId || null,
              managedById: item.managedById || null,
              code: code || `TEMP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            },
          });
          results.push(created);
        }
        return results;
      },
      { timeout: 30000 },
    );
  }

  async update(id: string, updateAssetDto: any) {
    const data = { ...updateAssetDto };

    // Normalize relation fields
    if (data.roomId === '') data.roomId = null;
    if (data.managedById === '') data.managedById = null;

    // Handle Date if purchaseDate is present
    if (data.purchaseDate) {
      data.purchaseDate = new Date(data.purchaseDate);
      if (isNaN(data.purchaseDate.getTime())) {
        delete data.purchaseDate;
      } else {
        data.purchaseYear = data.purchaseDate.getFullYear();
      }
    }

    return this.prisma.asset.update({
      where: { id },
      data,
    });
  }

  async findAll(query?: {
    page?: number;
    limit?: number | string;
    search?: string;
    category?: string;
    condition?: string;
    roomId?: string;
    assetStatus?: string;
  }) {
    // Parse numeric query params
    const page = Number(query?.page) || 1;
    let limit = Number(query?.limit) || 50;
    const isAll = query?.limit === 'all';

    if (isAll) {
      limit = 1000000; // Practically all
    }

    const skip = isAll ? 0 : (page - 1) * limit;

    const where: Prisma.AssetWhereInput = {
      deletedAt: null,
    };

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.category) where.category = query.category;
    if (query?.condition) where.condition = query.condition as any;
    if (query?.roomId) where.roomId = query.roomId;
    if (query?.assetStatus) where.assetStatus = query.assetStatus;

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: { room: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  private async generateCode(category: string, year: number | null): Promise<string> {
    const catCode = category.substring(0, 4).toUpperCase();
    const yearCode = year === null ? '0000' : year;
    const prefix = `SMK/${catCode}/${yearCode}/`;

    const count = await this.prisma.asset.count({
      where: {
        code: {
          startsWith: prefix,
        },
      },
    });

    const seq = (count + 1).toString().padStart(3, '0');
    let finalCode = `${prefix}${seq}`;

    // Extra check to see if this specific code already exists (just in case count is off)
    const existing = await this.prisma.asset.findUnique({
      where: { code: finalCode },
    });

    if (existing) {
      const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      finalCode = `${prefix}${seq}-${randomSuffix}`;
      console.log(`[AssetsService] Code collision on "${prefix}${seq}". Using random suffix: "${finalCode}"`);
    }

    return finalCode;
  }
}
