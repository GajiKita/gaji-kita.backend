import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeesService } from '../fees/fees.service';
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto';
import { FUND_SOURCE_TYPE, WITHDRAW_STATUS } from '@prisma/client';

import { PinataService } from '../pinata/pinata.service';

@Injectable()
export class WithdrawsService {
  constructor(
    private prisma: PrismaService,
    private feesService: FeesService,
    private pinataService: PinataService,
  ) {}

  async simulate(
    employeeId: string,
    payrollCycleId: string,
    requestedAmount: number,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    const payrollCycle = await this.prisma.payrollCycle.findUnique({
      where: { id: payrollCycleId },
    });
    const withdrawLimit = await this.prisma.withdrawLimit.findUnique({
      where: {
        employee_id_payroll_cycle_id: { employee_id: employeeId, payroll_cycle_id: payrollCycleId },
      },
    });

    if (!employee || !payrollCycle || !withdrawLimit) {
      throw new NotFoundException('Data not found for simulation');
    }

    const maxPossible = withdrawLimit.remaining_amount.toNumber();
    if (requestedAmount > maxPossible) {
      throw new BadRequestException(
        `Requested amount exceeds maximum possible of ${maxPossible}`,
      );
    }
    
    const daysWorked = await this.prisma.employeeWorkLog.count({
        where: {
          employee_id: employeeId,
          payroll_cycle_id: payrollCycleId,
          approved_by_id: { not: null },
        },
      });

    const progressRatio = daysWorked / payrollCycle.total_working_days;

    const feeBreakdown = await this.feesService.calculateFee(
      employee.company_id,
      requestedAmount,
      progressRatio,
    );

    return {
      max_possible_withdraw: maxPossible,
      ...feeBreakdown,
    };
  }

  async createRequest(createDto: CreateWithdrawRequestDto) {
    // 1. Fetch some details for the metadata
    const employee = await this.prisma.employee.findUnique({
      where: { id: createDto.employee_id },
      include: { user: true },
    });

    // 2. Pin metadata to IPFS
    const metadata = {
      type: 'withdrawSalary',
      employee_id: createDto.employee_id,
      wallet_address: employee?.wallet_address,
      amount: createDto.requested_amount,
      payroll_cycle_id: createDto.payroll_cycle_id,
      timestamp: new Date().toISOString(),
    };

    const cid = await this.pinataService.pinJSON(
      metadata,
      `Withdrawal Request - ${employee?.user?.wallet_address || 'Unknown'} - ${new Date().getTime()}`,
    );

    // 3. Create the request in DB
    return this.prisma.withdrawRequest.create({
      data: {
        ...createDto,
        status: WITHDRAW_STATUS.PENDING,
        ipfs_cid: cid,
      },
    });
  }

  async execute(requestId: string, approvedAmount: number, extraAaveFee: number = 0) {
    const request = await this.prisma.withdrawRequest.findUnique({
      where: { id: requestId },
      include: { employee: true, payroll_cycle: true },
    });

    if (!request) throw new NotFoundException('Withdraw request not found.');
    if (request.status !== WITHDRAW_STATUS.APPROVED) {
      throw new BadRequestException('Request is not in approved state.');
    }

    const lockPool = await this.prisma.companyLockPool.findFirst({
        where: { payroll_cycle_id: request.payroll_cycle_id }
    });

    if(!lockPool) throw new NotFoundException('Company lock pool not found');

    const sources: any[] = [];
    let remainingToFund = approvedAmount;
    
    // 1. Deduct from company lock pool
    const fromCompanyPool = Math.min(lockPool.available_amount.toNumber(), remainingToFund);

    if (fromCompanyPool > 0) {
        sources.push({
            source_type: FUND_SOURCE_TYPE.COMPANY_LOCK,
            amount: fromCompanyPool,
        });
        await this.prisma.companyLockPool.update({
            where: { id: lockPool.id },
            data: { available_amount: { decrement: fromCompanyPool } }
        });
        remainingToFund -= fromCompanyPool;
    }

    // 2. If insufficient, use INVESTOR_POOL or DEX_SWAP (conceptually)
    if (remainingToFund > 0) {
        // Find an investor with enough deposited amount (simple picking for now)
        const investor = await this.prisma.investor.findFirst({
            where: { deposited_amount: { gte: remainingToFund } }
        });

        if (investor) {
            sources.push({
                source_type: FUND_SOURCE_TYPE.INVESTOR_POOL,
                amount: remainingToFund,
                investor_id: investor.id,
            });
            await this.prisma.investor.update({
                where: { id: investor.id },
                data: { deposited_amount: { decrement: remainingToFund } }
            });
        } else {
            // Fallback to DEX_SWAP
            sources.push({
                source_type: FUND_SOURCE_TYPE.DEX_SWAP,
                amount: remainingToFund,
            });
        }
    }

    // 3. Calculate and distribute fees
    const daysWorked = await this.prisma.employeeWorkLog.count({
        where: {
          employee_id: request.employee_id,
          payroll_cycle_id: request.payroll_cycle_id,
          approved_by_id: { not: null },
        },
    });
    const progressRatio = daysWorked / request.payroll_cycle.total_working_days;
    const feeBreakdown = await this.feesService.calculateFee(
        request.employee.company_id,
        approvedAmount,
        progressRatio,
    );

    // Update company and investor reward balances
    await (this.prisma.company as any).update({
        where: { id: request.employee.company_id },
        data: { reward_balance: { increment: feeBreakdown.company_fee } }
    });

    // Simple investor fee distribution (pro-rata would be better, but simplified for now)
    if (feeBreakdown.investor_fee > 0) {
        const topInvestor = await this.prisma.investor.findFirst({
            where: { deleted: false }
        });
        if (topInvestor) {
            await this.prisma.investor.update({
                where: { id: topInvestor.id },
                data: { reward_balance: { increment: feeBreakdown.investor_fee } }
            });
        }
    }

    // 4. Update withdraw request and create fund sources
    const updatedRequest = await this.prisma.withdrawRequest.update({
        where: { id: requestId },
        data: {
            status: WITHDRAW_STATUS.PAID,
            approved_amount: approvedAmount,
            fee_total_amount: feeBreakdown.fee_total,
            company_fee_amount: feeBreakdown.company_fee,
            platform_fee_amount: feeBreakdown.platform_fee,
            investor_fee_amount: feeBreakdown.investor_fee,
            extra_liquidity_fee_amount: extraAaveFee,
            fund_sources: { create: sources }
        }
    });

    // 5. Update withdraw limit
    await this.prisma.withdrawLimit.update({
        where: {
            employee_id_payroll_cycle_id: {
                employee_id: request.employee_id,
                payroll_cycle_id: request.payroll_cycle_id,
            }
        },
        data: {
            used_amount: { increment: approvedAmount },
            remaining_amount: { decrement: approvedAmount }
        }
    });

    return updatedRequest;
  }
}
