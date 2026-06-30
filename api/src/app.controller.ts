import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('/api/health', 301)
  root() {}

  @Get('api/health')
  health() {
    return {
      status: 'ok',
      service: 'weatherguard-api',
      timestamp: new Date().toISOString(),
    };
  }
}
