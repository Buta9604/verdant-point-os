import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateTransactionDto, TransactionFilterDto } from './dto/sale.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.BUDTENDER)
  create(@Body() createTransactionDto: CreateTransactionDto, @CurrentUser('id') userId: string) {
    return this.salesService.create(createTransactionDto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query() paginationDto: PaginationDto, @Query() filterDto: TransactionFilterDto) {
    return this.salesService.findAll(paginationDto, filterDto);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getSalesSummary(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.salesService.getSalesSummary(new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.BUDTENDER)
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id/refund')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  refund(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.salesService.refund(id, userId);
  }
}
