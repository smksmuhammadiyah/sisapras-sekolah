import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) { }

  async getSettings() {
    const settings = await this.prisma.schoolSettings.findFirst();
    if (!settings) {
      // Create default if not exists
      return this.prisma.schoolSettings.create({
        data: {
          name: "SMK Negeri 1 Contoh",
          address: "Jl. Pendidikan No. 1",
        }
      });
    }
    return settings;
  }

  async updateSettings(data: any) {
    const settings = await this.prisma.schoolSettings.findFirst();
    if (settings) {
      return this.prisma.schoolSettings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      return this.prisma.schoolSettings.create({
        data,
      });
    }
  }
}
