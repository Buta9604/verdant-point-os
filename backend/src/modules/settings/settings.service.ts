import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { SettingCategory } from '@prisma/client';

@Injectable()
export class SettingsService {
  private readonly CACHE_PREFIX = 'setting:';
  private readonly CACHE_TTL = 3600;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async get(key: string): Promise<string | null> {
    // Try cache first
    const cached = await this.redis.get(`${this.CACHE_PREFIX}${key}`);
    if (cached) {
      return cached;
    }

    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });

    if (setting) {
      await this.redis.set(`${this.CACHE_PREFIX}${key}`, setting.value, this.CACHE_TTL);
      return setting.value;
    }

    return null;
  }

  async set(key: string, value: string, category?: SettingCategory, description?: string, updatedBy?: string) {
    const setting = await this.prisma.setting.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { key, value, category, description, updatedBy },
    });

    // Update cache
    await this.redis.set(`${this.CACHE_PREFIX}${key}`, value, this.CACHE_TTL);

    return setting;
  }

  async getAll() {
    return this.prisma.setting.findMany({
      orderBy: { category: 'asc' },
    });
  }

  async getByCategory(category: SettingCategory) {
    return this.prisma.setting.findMany({
      where: { category },
    });
  }

  async delete(key: string) {
    await this.redis.del(`${this.CACHE_PREFIX}${key}`);
    return this.prisma.setting.delete({
      where: { key },
    });
  }
}
