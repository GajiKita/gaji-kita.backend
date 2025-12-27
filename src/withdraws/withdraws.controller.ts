import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { WithdrawsService } from './withdraws.service';
import { SimulateWithdrawDto } from './dto/simulate-withdraw.dto';
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto';
import { ApproveWithdrawRequestDto } from './dto/approve-withdraw-request.dto';
import { TransactionResponse } from '../blockchain/dto/transaction-response.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('withdraws')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('withdraws')
export class WithdrawsController {
  constructor(
    private readonly withdrawsService: WithdrawsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('simulate')
  @Roles(ROLES.EMPLOYEE)
  @ApiOperation({ summary: 'Simulate withdrawal fees and amounts' })
  @ApiResponse({ status: 200, description: 'Return simulation results.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Can only simulate for self.' })
  simulate(@Query() simulateDto: SimulateWithdrawDto, @Req() req) {
    if (req.user.id !== simulateDto.employee_id) {
      throw new ForbiddenException('You can only simulate for yourself.');
    }
    return this.withdrawsService.simulate(
      simulateDto.employee_id,
      simulateDto.payroll_cycle_id,
      simulateDto.requested_amount,
    );
  }

  @Post('request')
  @Roles(ROLES.EMPLOYEE)
  @ApiOperation({ summary: 'Submit a withdrawal request and get transaction data' })
  @ApiResponse({ status: 201, description: 'Return transaction data for wallet signing.', type: TransactionResponse })
  @ApiResponse({ status: 403, description: 'Forbidden. Can only request for self.' })
  async createRequest(@Body() createRequestDto: CreateWithdrawRequestDto, @Req() req) {
    if (req.user.id !== createRequestDto.employee_id) {
      throw new ForbiddenException('You can only request for yourself.');
    }
    
    // 1. Create the request in DB
    const request = await this.withdrawsService.createRequest(createRequestDto);
    
    // 2. Prepare hex data for withdrawSalary(_cid)
    const hexData = this.blockchainService.encodeWithdrawSalary(request.ipfs_cid!);
    
    return {
      to: this.blockchainService.getContractAddress(),
      data: hexData,
      id: request.id,
      cid: request.ipfs_cid,
    };
  }

  @Post(':id/execute')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Approve and execute a withdrawal request' })
  @ApiResponse({ status: 201, description: 'The withdrawal has been successfully executed.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN role.' })
  @ApiResponse({ status: 404, description: 'Withdrawal request not found.' })
  execute(
    @Param('id') id: string,
    @Body() approveDto: ApproveWithdrawRequestDto,
  ) {
    return this.withdrawsService.execute(
      id,
      approveDto.approved_amount,
      approveDto.extra_aave_fee,
    );
  }
}
