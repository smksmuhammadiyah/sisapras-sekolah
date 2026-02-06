import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findOne(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username, isActive: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, isActive: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, isActive: true },
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
    // Using a more robust filter that covers NULL, true and excludes renamed users
    const users = await this.prisma.user.findMany({
      where: {
        isActive: { not: false },
        NOT: {
          username: { startsWith: 'deleted_' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Additional JS-level filter for absolute certainty
    return users.filter(u => u.isActive !== false && !u.username.startsWith('deleted_'));
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    if (data.password && typeof data.password === 'string') {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
        if (error.code === 'P2025') {
          throw new BadRequestException('User not found');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<any> {
    try {
      // 1. Try Hard Delete first (most effective)
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      // 2. Fallback to Soft Delete if there are history constraints
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new BadRequestException('User not found');

      const timestamp = Date.now();
      return this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          isApproved: false,
          username: `deleted_${timestamp}_${user.username}`,
          email: `${timestamp}_del_${user.email || 'noemail'}`,
        },
      });
    }
  }
}
