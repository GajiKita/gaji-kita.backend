import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  AdminStatsResponseDto,
  HRStatsResponseDto,
  InvestorStatsResponseDto,
} from './dto/analytics-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('admin')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Get global platform statistics (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Return platform-wide stats.', type: AdminStatsResponseDto })
  getAdminStats() {
    return this.analyticsService.getAdminStats();
  }

  @Get('hr')
  @Roles(ROLES.HR)
  @ApiOperation({ summary: 'Get company statistics (HR only)' })
  @ApiResponse({ status: 200, description: 'Return company-wide stats.', type: HRStatsResponseDto })
  getHRStats(@Req() req) {
    return this.analyticsService.getHRStats(req.user.id);
  }

  @Get('investor')
  @Roles(ROLES.INVESTOR)
  @ApiOperation({ summary: 'Get personal investment statistics (INVESTOR only)' })
  @ApiResponse({ status: 200, description: 'Return investor stats.', type: InvestorStatsResponseDto })
  getInvestorStats(@Req() req) {
    return this.analyticsService.getInvestorStats(req.user.id);
  }
}
