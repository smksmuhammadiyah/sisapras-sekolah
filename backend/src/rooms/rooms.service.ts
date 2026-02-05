import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    return this.prisma.room.create({
      data: createRoomDto,
    });
  }

  async createBulk(items: CreateRoomDto[]) {
    return this.prisma.$transaction(
      items.map((item) => this.prisma.room.create({ data: item })),
    );
  }

  async findAll() {
    return this.prisma.room.findMany({
      where: { deletedAt: null },
    });
  }

  async findOne(id: string) {
    return this.prisma.room.findFirst({
      where: { id, deletedAt: null },
      include: { assets: true },
    });
  }

  async remove(id: string) {
    return this.prisma.room.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.room.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async findDeleted() {
    return this.prisma.room.findMany({
      where: { deletedAt: { not: null } },
    });
  }
}
