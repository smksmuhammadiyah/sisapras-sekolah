import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuditModule } from './audit/audit.module';
import { ServicesModule } from './services/services.module';
import { StockModule } from './stock/stock.module';
import { ProcurementModule } from './procurement/procurement.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { YearsModule } from './years/years.module';
import { HealthModule } from './health/health.module';
import { CleanupModule } from './cron/cleanup.module';
import { MailModule } from './mail/mail.module';
import { LendingModule } from './lending/lending.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AssetsModule,
    RoomsModule,
    AuditModule,
    ServicesModule,
    StockModule,
    ProcurementModule,
    NotificationsModule,
    AnalyticsModule,
    SettingsModule,
    YearsModule,
    HealthModule,
    CleanupModule,
    MailModule,
    LendingModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
