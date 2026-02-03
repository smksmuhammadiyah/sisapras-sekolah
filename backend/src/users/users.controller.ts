import { Controller, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  approveUser(@Param('id') id: string) {
    return this.usersService.update(id, { isApproved: true, role: Role.USER }); // Default to USER on approval? Or keep GUEST? Plan said promote to STAFF/ADMIN manually. Let's just set isApproved=true. Actually, usually GUEST -> USER on approval makes sense. Let's just set isApproved.
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.update(id, { role });
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('isApproved') isApproved: boolean) {
    return this.usersService.update(id, { isApproved });
  }
}
