import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { CreateInvestorDto } from './dto/create-investor.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';

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
import { Req } from '@nestjs/common';
import { PinataService } from '../pinata/pinata.service';

@ApiTags('investors')
@ApiBearerAuth()
@Controller('investors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
export class InvestorsController {
  constructor(
    private readonly investorsService: InvestorsService,
    private readonly blockchainService: BlockchainService,
    private readonly pinataService: PinataService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new investor' })
  @ApiResponse({ status: 201, description: 'The investor has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN role.' })
  create(@Body() createInvestorDto: CreateInvestorDto) {
    return this.investorsService.create(createInvestorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all investors' })
  @ApiResponse({ status: 200, description: 'Return all investors.' })
  findAll() {
    return this.investorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get investor details by ID' })
  @ApiResponse({ status: 200, description: 'Return investor details.' })
  @ApiResponse({ status: 404, description: 'Investor not found.' })
  findOne(@Param('id') id: string) {
    return this.investorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update investor information' })
  @ApiResponse({ status: 200, description: 'The investor has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Investor not found.' })
  update(
    @Param('id') id: string,
    @Body() updateInvestorDto: UpdateInvestorDto,
  ) {
    return this.investorsService.update(id, updateInvestorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an investor' })
  @ApiResponse({ status: 200, description: 'The company has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Investor not found.' })
  remove(@Param('id') id: string) {
    return this.investorsService.remove(id);
  }

  @Post('prepare-deposit-liquidity')
  @Roles(ROLES.ADMIN, ROLES.INVESTOR)
  @ApiOperation({ summary: 'Prepare transaction data for depositing investor liquidity' })
  @ApiResponse({ status: 200, description: 'Return transaction data.', type: TransactionResponse })
  async prepareDepositLiquidity(@Body() prepareDto: PrepareTransactionDto) {
    const cid = await this.pinataService.pinJSON(
      {
        type: 'depositInvestorLiquidity',
        amount: prepareDto.amount,
        timestamp: new Date().toISOString(),
      },
      `Investor Deposit - ${new Date().getTime()}`,
    );

    const hexData = this.blockchainService.encodeDepositInvestorLiquidity(
      BigInt(prepareDto.amount),
      cid,
    );
    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
      cid: cid,
    };
  }

  @Post('prepare-withdraw-reward')
  @Roles(ROLES.ADMIN, ROLES.INVESTOR)
  @ApiOperation({ summary: 'Prepare transaction data for withdrawing investor rewards' })
  @ApiResponse({ status: 200, description: 'Return transaction data.', type: TransactionResponse })
  async prepareWithdrawReward(@Body() prepareDto: PrepareTransactionDto) {
    const cid = await this.pinataService.pinJSON(
      {
        type: 'withdrawInvestorReward',
        amount: prepareDto.amount,
        timestamp: new Date().toISOString(),
      },
      `Investor Reward Withdrawal - ${new Date().getTime()}`,
    );

    const hexData = this.blockchainService.encodeWithdrawInvestorReward(
      BigInt(prepareDto.amount),
      cid,
    );
    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
      cid: cid,
    };
  }

  @Patch('me/preferred-token')
  @Roles(ROLES.INVESTOR)
  @ApiOperation({ summary: 'Update investor preferred stablecoin and get transaction data' })
  @ApiResponse({ status: 200, description: 'Return transaction data.', type: TransactionResponse })
  async updateMePreferredToken(
    @Body() updateDto: UpdatePreferredTokenDto,
    @Req() req,
  ) {
    // 1. Update DB
    await this.investorsService.updatePreferredToken(req.user.id, updateDto.token_address);

    // 2. Prepare hex data
    const hexData = this.blockchainService.encodeSetInvestorPayoutToken(
      updateDto.token_address as Address,
    );

    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
    };
  }
}
