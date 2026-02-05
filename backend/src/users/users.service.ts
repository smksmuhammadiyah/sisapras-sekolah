import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    if (data.password && typeof data.password === 'string') {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }
    console.log(`Prisma updating user ID: ${id} with data:`, data);
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data,
      });
      console.log('Prisma Update Result:', updated);
      return updated;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Prisma Update Error:', error.message);
      }

      const errCode = (error as { code?: string })?.code;
      if (errCode) console.error('Error Code:', errCode);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
        if (error.code === 'P2025') {
          throw new BadRequestException('User not found or update failed');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<any> {
    // 1. Check for dependencies
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            procurements: true,
            audits: true,
            stockTransactions: true,
            lendings: true,
            reportedServices: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hasHistory =
      user._count.procurements > 0 ||
      user._count.audits > 0 ||
      user._count.stockTransactions > 0 ||
      user._count.lendings > 0 ||
      user._count.reportedServices > 0;

    if (hasHistory) {
      // Perform Deactivation (Anonymize email/username and set isActive: false)
      const timestamp = Date.now();
      return this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          isApproved: false,
          email: `deleted_${timestamp}_${user.email || 'noemail'}`,
          username: `deleted_${timestamp}_${user.username}`,
        },
      });
    }

    // 2. Hard Delete (only if no history)
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
