import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BlockchainService } from '../blockchain/blockchain.service';
import { TransactionResponse } from '../blockchain/dto/transaction-response.dto';
import { UpdatePreferredTokenDto } from '../blockchain/dto/update-preferred-token.dto';
import { Req, ForbiddenException } from '@nestjs/common';
import { Address } from 'viem';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.HR)
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly blockchainService: BlockchainService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new employee record' })
  @ApiResponse({ status: 201, description: 'The employee has been successfully created.', type: EmployeeResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN or HR role.' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'List all employees (ADMIN only)' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter employees by company UUID' })
  @ApiResponse({ status: 200, description: 'Return list of employees.', type: [EmployeeResponseDto] })
  findAll(@Query('companyId') companyId?: string) {
    return this.employeesService.findAll(companyId);
  }

  @Get('company/:companyId')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'List employees by company ID (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Return list of employees for the company.', type: [EmployeeResponseDto] })
  findByCompany(@Param('companyId') companyId: string) {
    return this.employeesService.findByCompanyId(companyId);
  }

  @Get('me/company')
  @Roles(ROLES.HR)
  @ApiOperation({ summary: 'List employees for HR current company (HR only)' })
  @ApiResponse({ status: 200, description: 'Return list of employees for the HR company.', type: [EmployeeResponseDto] })
  async findMyCompanyEmployees(@Req() req) {
    const companyId = await this.employeesService.findCompanyByUserId(req.user.id);
    if (!companyId) {
      throw new ForbiddenException('HR user not associated with any company');
    }
    return this.employeesService.findByCompanyId(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee details by ID' })
  @ApiResponse({ status: 200, description: 'Return employee details.', type: EmployeeResponseDto })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee information' })
  @ApiResponse({ status: 200, description: 'The employee has been successfully updated.', type: EmployeeResponseDto })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an employee record' })
  @ApiResponse({ status: 200, description: 'The employee has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Patch('me/preferred-token')
  @Roles(ROLES.EMPLOYEE)
  @ApiOperation({ summary: 'Update preferred stablecoin and get transaction data' })
  @ApiResponse({ status: 200, description: 'Return transaction data.', type: TransactionResponse })
  async updateMePreferredToken(
    @Body() updateDto: UpdatePreferredTokenDto,
    @Req() req,
  ) {
    // 1. Update DB (via service)
    await this.employeesService.updatePreferredToken(req.user.id, updateDto.token_address);

    // 2. Prepare hex data
    const hexData = this.blockchainService.encodeSetPreferredPayoutToken(
      updateDto.token_address as Address,
    );

    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
    };
  }
}
