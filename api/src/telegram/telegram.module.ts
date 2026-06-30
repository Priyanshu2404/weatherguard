import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
