import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [totalUsers, totalCompanies, totalWithdrawRequests, totalFees] = await Promise.all([
      this.prisma.user.count({ where: { deleted: false } }),
      this.prisma.company.count({ where: { deleted: false } }),
      this.prisma.withdrawRequest.count({ where: { deleted: false } }),
      this.prisma.withdrawRequest.aggregate({
        where: { status: 'PAID', deleted: false },
        _sum: { fee_total_amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalCompanies,
      totalWithdrawRequests,
      totalFeesPlatform: totalFees._sum.fee_total_amount?.toNumber() || 0,
    };
  }

  async getHRStats(userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { user_id: userId, deleted: false },
      select: { company_id: true },
    });

    if (!employee) return null;

    const companyId = employee.company_id;

    const [totalEmployees, pendingWorklogs, totalWithdrawals] = await Promise.all([
      this.prisma.employee.count({ where: { company_id: companyId, deleted: false } }),
      this.prisma.employeeWorkLog.count({
        where: {
          employee: { company_id: companyId },
          approved_by_id: null,
          deleted: false,
        },
      }),
      this.prisma.withdrawRequest.aggregate({
        where: {
          employee: { company_id: companyId },
          status: 'PAID',
          deleted: false,
        },
        _sum: { requested_amount: true },
      }),
    ]);

    return {
      totalEmployees,
      pendingWorklogs,
      totalWithdrawals: totalWithdrawals._sum.requested_amount?.toNumber() || 0,
    };
  }

  async getInvestorStats(userId: string) {
    const investor = await this.prisma.investor.findFirst({
      where: { user_id: userId, deleted: false },
    });

    if (!investor) return null;

    return {
      depositedAmount: investor.deposited_amount.toNumber(),
      rewardBalance: investor.reward_balance.toNumber(),
      withdrawnRewards: investor.withdrawn_rewards.toNumber(),
    };
  }
}
