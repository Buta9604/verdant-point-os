import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, ComplianceEventType } from '@prisma/client';

@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('logs')
  getAllLogs(@Query() paginationDto: PaginationDto) {
    return this.complianceService.getAllLogs(paginationDto);
  }

  @Get('logs/:eventType')
  getLogsByType(
    @Param('eventType') eventType: ComplianceEventType,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.complianceService.getLogsByType(eventType, paginationDto);
  }

  @Get('export')
  exportComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.complianceService.exportComplianceReport(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
