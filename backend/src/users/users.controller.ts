import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  UseGuards,
  Delete,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    userId?: string;
    sub?: string;
    username: string;
    role: Role;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('profile')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    console.log('====== [START] PROFILE UPDATE DEBUG ======');
    console.log('Request User Object:', JSON.stringify(req.user, null, 2));
    console.log('Request Body:', JSON.stringify(updateProfileDto, null, 2));

    // Try multiple possible ID fields
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    console.log('Resolved User ID:', userId);

    if (!userId) {
      console.error('CRITICAL: No User ID found in request object!');
      throw new BadRequestException(
        'Sesi kadaluarsa atau User ID tidak ditemukan. Silakan login kembali.',
      );
    }

    try {
      const result = await this.usersService.update(userId, updateProfileDto);
      console.log('Successfully updated profile for user:', userId);
      return result;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('Profile Update Failed at Controller Layer:', errMsg);
      // Fallback: If it's a prisma error P2025, maybe the ID in token doesn't match DB id?
      throw error;
    } finally {
      console.log('====== [END] PROFILE UPDATE DEBUG ======');
    }
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  approveUser(@Param('id') id: string, @Body() dto?: UpdateUserDto) {
    return this.usersService.update(id, {
      isApproved: true,
      role: dto?.role || Role.USER,
    });
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    if (!dto.role) throw new BadRequestException('Role is required');
    return this.usersService.update(id, { role: dto.role });
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, {
      isApproved: dto.isApproved,
      isActive: dto.isActive,
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
