import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { AccruedSalaryResponseDto } from './dto/accrued-salary-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) { }

  @Get('me/accrued')
  @Roles(ROLES.EMPLOYEE)
  @ApiOperation({ summary: 'Get current accrued salary for the authenticated employee' })
  @ApiResponse({ status: 200, description: 'Return real-time salary accrual data.', type: AccruedSalaryResponseDto })
  getMyAccrued(@Req() req) {
    return this.payrollService.getMyAccruedSalary(req.user.id);
  }
}
