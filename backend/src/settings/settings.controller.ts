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

import { Prisma } from '@prisma/client';

const restoreDir = './temp-restores';
if (!fs.existsSync(restoreDir)) {
  fs.mkdirSync(restoreDir);
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
    res.download(filePath, (err) => {
      // Clean up the file after it's sent
      if (!err) {
        fs.unlinkSync(filePath);
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
      destination: './temp-restores',
      filename: (req, file, cb) => {
        cb(null, `restore-${Date.now()}.sql`);
      }
    })
  }))
  async restoreDatabase(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File tidak ditemukan');
    }
    return this.settingsService.restoreDatabase(file.path);
  }
}
