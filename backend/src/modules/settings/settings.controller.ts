import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, SettingCategory } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getAll() {
    return this.settingsService.getAll();
  }

  @Get('category/:category')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getByCategory(@Param('category') category: SettingCategory) {
    return this.settingsService.getByCategory(category);
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  set(
    @Body('key') key: string,
    @Body('value') value: string,
    @Body('category') category: SettingCategory,
    @Body('description') description: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.settingsService.set(key, value, category, description, userId);
  }

  @Delete(':key')
  @Roles(UserRole.ADMIN)
  remove(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}
