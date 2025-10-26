import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  getRoot() {
    return {
      name: 'Verdant Point Cannabis POS API',
      version: '1.0.0',
      status: 'running',
      documentation: '/api/v1/docs',
    };
  }
}
