import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlockchainService } from '../blockchain/blockchain.service';
import { TransactionResponse } from '../blockchain/dto/transaction-response.dto';
import { PrepareTransactionDto } from '../blockchain/dto/prepare-transaction.dto';
import { UpdatePreferredTokenDto } from '../blockchain/dto/update-preferred-token.dto';
import { Address } from 'viem';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new company' })
  @ApiResponse({ status: 201, description: 'The company has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all companies' })
  @ApiResponse({ status: 200, description: 'Return all companies.' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company details by ID' })
  @ApiResponse({ status: 200, description: 'Return company details.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company information' })
  @ApiResponse({ status: 200, description: 'The company has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a company' })
  @ApiResponse({ status: 200, description: 'The company has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }

  @Post('prepare-lock-liquidity')
  @Roles(ROLES.ADMIN) // In a real app, this could also be a specific company role
  @ApiOperation({ summary: 'Prepare transaction data for locking company liquidity' })
  @ApiResponse({ status: 200, description: 'Return transaction data.', type: TransactionResponse })
  prepareLockLiquidity(@Body() prepareDto: PrepareTransactionDto) {
    const hexData = this.blockchainService.encodeLockCompanyLiquidity(
      BigInt(prepareDto.amount),
      prepareDto.cid,
    );
    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
    };
  }

  @Post('prepare-withdraw-reward')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Prepare transaction data for withdrawing company rewards' })
  @ApiResponse({ status: 200, description: 'Return transaction data.', type: TransactionResponse })
  prepareWithdrawReward(@Body() prepareDto: PrepareTransactionDto) {
    const hexData = this.blockchainService.encodeWithdrawCompanyReward(
      BigInt(prepareDto.amount),
      prepareDto.cid,
    );
    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
    };
  }

  @Patch(':id/preferred-token')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Update company preferred stablecoin and get transaction data' })
  @ApiResponse({ status: 200, description: 'Return transaction data.', type: TransactionResponse })
  async updatePreferredToken(
    @Param('id') id: string,
    @Body() updateDto: UpdatePreferredTokenDto,
  ) {
    // 1. Update DB
    await this.companiesService.updatePreferredToken(id, updateDto.token_address);

    // 2. Prepare hex data
    const hexData = this.blockchainService.encodeSetCompanyPayoutToken(
      id as Address,
      updateDto.token_address as Address,
    );

    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
    };
  }
}
