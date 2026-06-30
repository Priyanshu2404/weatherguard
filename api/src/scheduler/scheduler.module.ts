import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { UsersModule } from '../users/users.module';
import { WeatherModule } from '../weather/weather.module';
import { TelegramModule } from '../telegram/telegram.module';

import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('trigger')
  async trigger() {
    await this.schedulerService.triggerNow();
    return { message: 'Weather alert job triggered' };
  }
}

@Module({
  imports: [UsersModule, WeatherModule, TelegramModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {}
