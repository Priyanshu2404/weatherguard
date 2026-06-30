import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramService } from '../telegram/telegram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { UserDocument, UserStatus } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: UserDocument) {
    return user;
  }

  @Patch('me/city')
  updateMyCity(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateCityDto,
  ) {
    return this.usersService.updateCity(user._id.toString(), dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const updatedUser = await this.usersService.updateStatus(id, dto);

    if (dto.status === UserStatus.APPROVED && updatedUser.telegramLinkToken) {
      await this.telegramService.sendApprovalNotification(
        updatedUser.email,
        updatedUser.name,
        updatedUser.telegramLinkToken,
      );
    }

    return updatedUser;
  }
}
