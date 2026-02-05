import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.schoolSettings.findFirst();
    if (!settings) {
      // Create default if not exists
      return this.prisma.schoolSettings.create({
        data: {
          name: 'SMK Negeri 1 Contoh',
          address: 'Jl. Pendidikan No. 1',
        },
      });
    }
    return settings;
  }

  async updateSettings(
    data: Prisma.SchoolSettingsUpdateInput | Prisma.SchoolSettingsCreateInput,
  ) {
    const settings = await this.prisma.schoolSettings.findFirst();
    if (settings) {
      return this.prisma.schoolSettings.update({
        where: { id: settings.id },
        data: data as Prisma.SchoolSettingsUpdateInput,
      });
    } else {
      return this.prisma.schoolSettings.create({
        data: data as Prisma.SchoolSettingsCreateInput,
      });
    }
  }
}
