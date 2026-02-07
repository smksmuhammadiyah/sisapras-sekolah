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
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new InternalServerErrorException('Database URL not found in environment');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sql`;
    const tempDir = path.join(process.cwd(), 'temp-backups');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filePath = path.join(tempDir, fileName);

    try {
      // Execute pg_dump. Using --dbname to pass the whole URL directly
      await execPromise(`pg_dump --dbname="${dbUrl}" --file="${filePath}" --no-owner --no-privileges`);
      return filePath;
    } catch (error) {
      console.error('Backup failed:', error);
      throw new InternalServerErrorException('Gagal membuat cadangan database');
    }
  }

  async restoreDatabase(filePath: string) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new InternalServerErrorException('Database URL not found in environment');
    }

    try {
      // In a real restore, you might want to drop schemas or tables first, 
      // but for simplicity with psql, we'll just run the script.
      // CAUTION: This can be destructive or cause conflicts if not handled carefully.
      await execPromise(`psql --dbname="${dbUrl}" --file="${filePath}"`);
      return { success: true, message: 'Database berhasil dipulihkan' };
    } catch (error) {
      console.error('Restore failed:', error);
      throw new InternalServerErrorException('Gagal memulihkan database');
    } finally {
      // Clean up the temp file after restore attempt
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
