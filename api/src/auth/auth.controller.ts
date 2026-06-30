import {
  Controller,
  Get,
  Post,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- Google ---
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport redirects to Google — no body needed
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ) {
    this.authService.login(user, res);
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }

  // --- GitHub ---
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {
    // Passport redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ) {
    this.authService.login(user, res);
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }

  // --- Session ---
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.logout(res);
  }
}
