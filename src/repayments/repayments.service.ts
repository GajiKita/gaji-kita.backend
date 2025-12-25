import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WITHDRAW_STATUS } from '@prisma/client';

@Injectable()
export class RepaymentsService {
  constructor(private prisma: PrismaService) {}

  async processRepaymentsForCycle(payrollCycleId: string) {
    const payrollCycle = await this.prisma.payrollCycle.findUnique({
      where: { id: payrollCycleId },
    });

    if (!payrollCycle) {
      throw new NotFoundException('Payroll cycle not found');
    }

    const withdrawsToRepay = await this.prisma.withdrawRequest.findMany({
      where: {
        payroll_cycle_id: payrollCycleId,
        status: WITHDRAW_STATUS.PAID, // Repay requests that are paid out
      },
    });

    const repaymentRecords: any[] = [];
    for (const withdraw of withdrawsToRepay) {
      // In a real scenario, this would involve a payment gateway or blockchain transaction
      const approvedAmount = withdraw.approved_amount?.toNumber() ?? 0;
      const feeTotalAmount = withdraw.fee_total_amount?.toNumber() ?? 0;
      const repayAmount = approvedAmount + feeTotalAmount;
      
      const record = await this.prisma.repayRecord.create({
        data: {
          withdraw_request_id: withdraw.id,
          employee_id: withdraw.employee_id,
          payroll_cycle_id: withdraw.payroll_cycle_id,
          repay_amount: repayAmount,
          repay_source: 'PAYROLL_DEDUCTION',
          tx_hash: `repaid-at-${new Date().toISOString()}`, // Placeholder
          repaid_at: new Date(),
        },
      });
      repaymentRecords.push(record);

      // Update withdraw request status
      await this.prisma.withdrawRequest.update({
          where: { id: withdraw.id },
          data: { status: WITHDRAW_STATUS.PAID } // This status should probably be `REPAID`
      })
    }

    return {
      message: `Processed ${repaymentRecords.length} repayments.`,
      repaymentRecords,
    };
  }
}
