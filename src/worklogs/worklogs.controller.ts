import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WorklogsService } from './worklogs.service';
import { CreateWorklogDto } from './dto/create-worklog.dto';
import { WorklogSyncResponseDto } from './dto/worklog-sync-response.dto';
import { WorklogResponseDto } from './dto/worklog-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionResponse } from '../blockchain/dto/transaction-response.dto';

@ApiTags('worklogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('worklogs')
export class WorklogsController {
  constructor(private readonly worklogsService: WorklogsService) { }

  @Post()
  @Roles(ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN)
  @ApiOperation({ summary: 'Submit a new work log entry' })
  @ApiResponse({ status: 201, description: 'The work log has been successfully created.', type: WorklogResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires EMPLOYEE, HR, or ADMIN role.' })
  create(@Body() createWorklogDto: CreateWorklogDto) {
    return this.worklogsService.create(createWorklogDto);
  }

  @Post('check-in')
  @Roles(ROLES.EMPLOYEE)
  @ApiOperation({ summary: 'Employee check-in for the day' })
  @ApiQuery({ name: 'payrollCycleId', required: true })
  @ApiResponse({ status: 201, description: 'Check-in successful.', type: WorklogResponseDto })
  checkIn(@Req() req, @Query('payrollCycleId') payrollCycleId: string) {
    return this.worklogsService.checkIn(req.user.id, payrollCycleId);
  }

  @Post(':id/check-out')
  @Roles(ROLES.EMPLOYEE)
  @ApiOperation({ summary: 'Employee check-out for the day' })
  @ApiResponse({ status: 200, description: 'Check-out successful.', type: WorklogResponseDto })
  checkOut(@Param('id') id: string, @Body('hours') hours: number) {
    return this.worklogsService.checkOut(id, hours);
  }

  @Get()
  @Roles(ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN)
  @ApiOperation({ summary: 'List work logs for an employee' })
  @ApiQuery({ name: 'employeeId', required: true, description: 'Filter logs by employee UUID' })
  @ApiResponse({ status: 200, description: 'Return list of work logs.', type: [WorklogResponseDto] })
  findAll(@Query('employeeId') employeeId: string) {
    // Add logic to ensure user can only see their own logs unless HR/ADMIN
    return this.worklogsService.findAll(employeeId);
  }

  @Patch(':id/approve')
  @Roles(ROLES.HR, ROLES.ADMIN)
  @ApiOperation({ summary: 'Approve a work log entry and get blockchain sync data' })
  @ApiResponse({
    status: 200,
    description: 'The work log has been successfully approved. Returns blockchain sync data.',
    type: WorklogSyncResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Work log not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires HR or ADMIN role.' })
  approve(@Param('id') id: string, @Req() req) {
    // In a real app, the approverId comes from the authenticated user
    const approverId = req.user.id;
    return this.worklogsService.approve(id, approverId);
  }
}
