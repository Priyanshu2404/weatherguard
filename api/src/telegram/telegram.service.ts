import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { UsersService } from '../users/users.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '');
    this.bot = new Telegraf(token || 'placeholder:placeholder');
  }

  onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '');
    if (!token || token === 'your_telegram_bot_token') {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN not configured — bot will not start. Set it in .env to enable Telegram features.',
      );
      return;
    }

    this.registerHandlers();

    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Telegram running in webhook mode');
    } else {
      this.bot.launch().catch((err) => {
        this.logger.error('Failed to launch Telegram bot', err);
      });
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
      this.logger.log('Telegram bot started in polling mode');
    }
  }

  async handleUpdate(update: any): Promise<void> {
    await this.bot.handleUpdate(update);
  }

  private registerHandlers() {
    this.bot.start((ctx: Context) => {
      ctx.reply(
        'Welcome to WeatherGuard.\n\n' +
          'If you have been approved, send your link token using:\n' +
          '/link YOUR_TOKEN\n\n' +
          'Once linked, you can set your city with:\n' +
          '/setcity CITY_NAME',
      );
    });

    this.bot.command('link', async (ctx: Context) => {
      const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
      const parts = text.trim().split(/\s+/);
      const token = parts[1];

      if (!token) {
        ctx.reply('Usage: /link YOUR_TOKEN');
        return;
      }

      const user = await this.usersService.findByTelegramLinkToken(token);
      if (!user) {
        ctx.reply('Invalid or expired token. Please check your approval email.');
        return;
      }

      const chatId = String(ctx.chat?.id);
      const username = ctx.from?.username ?? null;

      await this.usersService.linkTelegram(user._id.toString(), chatId, username);

      ctx.reply(
        `Your Telegram account has been linked to ${user.email}.\n` +
          'Set your alert city with:\n/setcity CITY_NAME',
      );

      this.logger.log(`Telegram account linked for user ${user.email}`);
    });

    this.bot.command('setcity', async (ctx: Context) => {
      const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
      const parts = text.trim().split(/\s+/);
      parts.shift();
      const city = parts.join(' ');

      if (!city) {
        ctx.reply('Usage: /setcity London');
        return;
      }

      const chatId = String(ctx.chat?.id);
      const user = await this.usersService.findAll().then((users) =>
        users.find((u) => u.telegramChatId === chatId),
      );

      if (!user) {
        ctx.reply('Your Telegram account is not linked yet. Use /link first.');
        return;
      }

      await this.usersService.updateCity(user._id.toString(), { city });
      ctx.reply(`Alert city set to: ${city}`);
    });
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, text);
    } catch (err) {
      this.logger.error(`Failed to send message to chatId ${chatId}`, err);
    }
  }

  async sendApprovalNotification(
    email: string,
    name: string,
    linkToken: string,
  ): Promise<void> {
    this.logger.log(
      `Approval notification prepared for ${email} — token: ${linkToken}`,
    );
  }

  async sendWeatherAlert(chatId: string, weather: WeatherPayload): Promise<void> {
    const message =
      `Weather alert for ${weather.city}\n\n` +
      `Condition: ${weather.description}\n` +
      `Temperature: ${weather.temp}C (feels like ${weather.feelsLike}C)\n` +
      `Humidity: ${weather.humidity}%\n` +
      `Wind: ${weather.windSpeed} m/s`;

    await this.sendMessage(chatId, message);
  }
}

export interface WeatherPayload {
  city: string;
  description: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
}
