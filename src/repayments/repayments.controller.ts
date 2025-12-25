import { Controller, Post, Param, UseGuards, Body } from '@nestjs/common';
import { RepaymentsService } from './repayments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlockchainService } from '../blockchain/blockchain.service';
import { TransactionResponse } from '../blockchain/dto/transaction-response.dto';
import { PrepareTransactionDto } from '../blockchain/dto/prepare-transaction.dto';

@ApiTags('repayments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
@Controller('repayments')
export class RepaymentsController {
  constructor(
    private readonly repaymentsService: RepaymentsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post('process-cycle/:cycleId')
  @ApiOperation({ summary: 'Process all pending repayments for a specific payroll cycle' })
  @ApiResponse({ status: 201, description: 'The repayments have been successfully processed.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN role.' })
  @ApiResponse({ status: 404, description: 'Payroll cycle not found.' })
  processCycle(@Param('cycleId') cycleId: string) {
    return this.repaymentsService.processRepaymentsForCycle(cycleId);
  }

  @Post('prepare-platform-fee-withdrawal')
  @ApiOperation({ summary: 'Prepare transaction data for withdrawing platform fees' })
  @ApiResponse({ status: 200, description: 'Return transaction data.', type: TransactionResponse })
  preparePlatformFeeWithdrawal(@Body() prepareDto: PrepareTransactionDto) {
    const hexData = this.blockchainService.encodeWithdrawPlatformFee(
      BigInt(prepareDto.amount),
      prepareDto.cid,
    );
    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
    };
  }
}
