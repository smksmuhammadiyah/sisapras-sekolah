import { Controller, Get, Patch, Post, Body, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

import { Prisma } from '@prisma/client';

const restoreDir = path.join(os.tmpdir(), 'temp-restores');
if (!fs.existsSync(restoreDir)) {
  try {
    fs.mkdirSync(restoreDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateSettings(@Body() data: Prisma.SchoolSettingsUpdateInput) {
    return this.settingsService.updateSettings(data);
  }

  @Post('backup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async downloadBackup(@Res() res: Response) {
    const filePath = await this.settingsService.generateBackup();
    const fileName = `backup-${new Date().toISOString()}.json`;

    res.download(filePath, fileName, (err) => {
      if (!err) {
        // Clean up the file after it's sent
        // Note: usage of fs.unlinkSync is fine here for temporary files
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.error('Error cleaning up backup file:', e);
        }
      } else {
        console.error('Download error:', err);
      }
    });
  }

  @Post('restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(os.tmpdir(), 'temp-restores');
        if (!fs.existsSync(dir)) {
          try {
            fs.mkdirSync(dir, { recursive: true });
          } catch (err) {
            if (err.code !== 'EEXIST') throw err;
          }
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        cb(null, `restore-${Date.now()}.json`);
      }
    })
  }))
  async restoreDatabase(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('File tidak ditemukan');
    }
    return this.settingsService.restoreDatabase(file.path);
  }

  // Report Settings Endpoints
  @Get('report')
  getReportSettings() {
    return this.settingsService.getReportSettings();
  }

  @Patch('report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateReportSettings(@Body() data: any) {
    return this.settingsService.updateReportSettings(data);
  }
}
