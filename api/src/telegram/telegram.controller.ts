import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() update: any) {
    await this.telegramService.handleUpdate(update);
    return { ok: true };
  }
}
