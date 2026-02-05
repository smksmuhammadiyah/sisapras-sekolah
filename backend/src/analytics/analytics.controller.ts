import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.STAFF)
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('user-summary')
  @UseGuards(JwtAuthGuard)
  getUserSummary(@Request() req) {
    return this.analyticsService.getUserStats(req.user.userId);
  }

  @Get('staff-summary')
  @UseGuards(JwtAuthGuard)
  // Logic: Staff stats might be accessible to STAFF and ADMIN?
  @Roles(Role.ADMIN, Role.STAFF)
  getStaffSummary() {
    return this.analyticsService.getStaffStats();
  }
}
