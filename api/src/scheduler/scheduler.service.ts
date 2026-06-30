import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';
import { WeatherService } from '../weather/weather.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly weatherService: WeatherService,
    private readonly telegramService: TelegramService,
  ) {}

  // Runs at 08:00 and 20:00 every day
  @Cron('0 8,20 * * *')
  async sendWeatherAlerts() {
    this.logger.log('Running scheduled weather alert job');

    const users = await this.usersService.findApprovedWithTelegram();

    if (users.length === 0) {
      this.logger.log('No eligible users for weather alerts');
      return;
    }

    // Deduplicate cities to minimise API calls
    const cityToUsers = new Map<string, typeof users>();
    for (const user of users) {
      const city = user.city!;
      if (!cityToUsers.has(city)) cityToUsers.set(city, []);
      cityToUsers.get(city)!.push(user);
    }

    for (const [city, cityUsers] of cityToUsers.entries()) {
      try {
        const weather = await this.weatherService.getCurrentWeather(city);

        for (const user of cityUsers) {
          await this.telegramService.sendWeatherAlert(user.telegramChatId!, weather);
          this.logger.log(`Alert sent to ${user.email} for city ${city}`);
        }
      } catch (err) {
        this.logger.error(`Failed to process alerts for city ${city}`, err);
      }
    }

    this.logger.log(`Weather alert job complete. Processed ${users.length} user(s)`);
  }

  // Manual trigger endpoint helper — useful for demos and testing
  async triggerNow() {
    await this.sendWeatherAlerts();
  }
}
