import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) { }

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

  async generateBackup() {
    try {
      // Fetch all data from all models
      // We need to fetch in order of dependencies for reference, but for backup we just dump everything
      const [
        users,
        academicYears,
        assets,
        services,
        audits,
        auditItems,
        lendings,
        schoolSettings,
        reportSettings
      ] = await Promise.all([
        this.prisma.user.findMany(),
        this.prisma.academicYear.findMany(),
        this.prisma.asset.findMany(),
        this.prisma.service.findMany(),
        this.prisma.audit.findMany(),
        this.prisma.auditItem.findMany(),
        this.prisma.lending.findMany(),
        this.prisma.schoolSettings.findMany(),
        this.prisma.reportSettings.findMany(),
      ]);

      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          users,
          academicYears,
          assets,
          services,
          audits,
          auditItems,
          lendings,
          schoolSettings,
          reportSettings
        }
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup-${timestamp}.json`;
      const tempDir = path.join('/tmp', 'temp-backups');

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      return filePath;
    } catch (error) {
      console.error('Backup failed:', error);
      throw new InternalServerErrorException('Gagal membuat cadangan database');
    }
  }

  async restoreDatabase(filePath: string) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const backup = JSON.parse(fileContent);

      if (!backup.data) {
        throw new Error('Format file backup tidak valid');
      }

      const {
        users,
        academicYears,
        assets,
        services,
        audits,
        auditItems,
        lendings,
        schoolSettings,
        reportSettings
      } = backup.data;

      // Use interactive transaction to ensure atomicity
      await this.prisma.$transaction(async (tx) => {
        // 1. Clean up existing data (Delete in reverse dependency order)
        await tx.auditItem.deleteMany();
        await tx.audit.deleteMany();
        await tx.lending.deleteMany();
        await tx.service.deleteMany();
        await tx.asset.deleteMany();
        await tx.academicYear.deleteMany();
        await tx.schoolSettings.deleteMany();
        await tx.reportSettings.deleteMany();
        // Users are kept if possible, or we might need to handle current admin session.
        // For full restore, we usually replace everything.
        // CAUTION: Deleting users might kill current session if not careful.
        // Let's delete all users EXCEPT the one initiating if possible, or just all.
        // For simplicity and correctness of restore, we delete all.
        await tx.user.deleteMany();

        // 2. Insert new data (Insert in dependency order)
        // Users
        if (users?.length > 0) await tx.user.createMany({ data: users });

        // Settings
        if (schoolSettings?.length > 0) await tx.schoolSettings.createMany({ data: schoolSettings });
        if (reportSettings?.length > 0) await tx.reportSettings.createMany({ data: reportSettings });

        // Years
        if (academicYears?.length > 0) await tx.academicYear.createMany({ data: academicYears });

        // Assets
        if (assets?.length > 0) await tx.asset.createMany({ data: assets });

        // Services
        if (services?.length > 0) await tx.service.createMany({ data: services });

        // Lendings
        if (lendings?.length > 0) await tx.lending.createMany({ data: lendings });

        // Audits (require header then items)
        if (audits?.length > 0) await tx.audit.createMany({ data: audits });
        if (auditItems?.length > 0) await tx.auditItem.createMany({ data: auditItems });
      });

      return { success: true, message: 'Database berhasil dipulihkan' };
    } catch (error) {
      console.error('Restore failed:', error);
      throw new InternalServerErrorException('Gagal memulihkan database: ' + (error.message || 'Error validasi data'));
    } finally {
      // Clean up the temp file after restore attempt
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  // Report Settings Methods
  async getReportSettings() {
    const settings = await this.prisma.reportSettings.findFirst();
    if (!settings) {
      // Create default if not exists
      return this.prisma.reportSettings.create({
        data: {},
      });
    }
    return settings;
  }

  async updateReportSettings(data: Prisma.ReportSettingsUpdateInput) {
    const settings = await this.prisma.reportSettings.findFirst();
    if (settings) {
      return this.prisma.reportSettings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      return this.prisma.reportSettings.create({
        data: data as Prisma.ReportSettingsCreateInput,
      });
    }
  }
}
