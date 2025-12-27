import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PayrollCyclesService } from './payroll-cycles.service';
import { CreatePayrollCycleDto } from './dto/create-payroll-cycle.dto';
import { PayrollCycleResponseDto } from './dto/payroll-cycle-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('payroll-cycles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.HR)
@Controller('payroll-cycles')
export class PayrollCyclesController {
  constructor(private readonly payrollCyclesService: PayrollCyclesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new payroll cycle' })
  @ApiResponse({ status: 201, description: 'The payroll cycle has been successfully created.', type: PayrollCycleResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN or HR role.' })
  create(@Body() createPayrollCycleDto: CreatePayrollCycleDto) {
    return this.payrollCyclesService.create(createPayrollCycleDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all payroll cycles' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter payroll cycles by company UUID' })
  @ApiResponse({ status: 200, description: 'Return list of payroll cycles.', type: [PayrollCycleResponseDto] })
  findAll(@Query('companyId') companyId: string) {
    return this.payrollCyclesService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll cycle details by ID' })
  @ApiResponse({ status: 200, description: 'Return payroll cycle details.', type: PayrollCycleResponseDto })
  @ApiResponse({ status: 404, description: 'Payroll cycle not found.' })
  findOne(@Param('id') id: string) {
    return this.payrollCyclesService.findOne(id);
  }
}
