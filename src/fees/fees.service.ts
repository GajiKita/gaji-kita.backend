import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FEE_MODE } from '@prisma/client';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  async calculateFee(
    companyId: string,
    requestedAmount: number,
    progressRatio: number, // days_worked / total_working_days
  ) {
    const feeRule = await this.prisma.withdrawFeeRule.findUnique({
      where: { company_id: companyId },
    });

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!feeRule || !company) {
      throw new NotFoundException('Fee rule or company not found');
    }

    const BPS_DENOMINATOR = 10000;
    const gapRatio = 1 - progressRatio;
    let feeTotal = 0;

    if (feeRule.fee_mode === FEE_MODE.PERCENTAGE) {
      const earlyAccessPenalty =
        feeRule.early_access_penalty_perc_per_gap?.toNumber() ?? 0;
      const basePercentage = feeRule.base_percentage?.toNumber() ?? 0;
      const maxPercentage = feeRule.max_percentage?.toNumber() ?? Infinity;

      let dynamicPercentage =
        basePercentage + gapRatio * earlyAccessPenalty;
      dynamicPercentage = Math.min(dynamicPercentage, maxPercentage);

      feeTotal = requestedAmount * (dynamicPercentage / 100);
    } else if (feeRule.fee_mode === FEE_MODE.FIXED) {
      feeTotal = feeRule.base_fixed_amount?.toNumber() ?? 0;
    } else if (feeRule.fee_mode === FEE_MODE.MIXED) {
      const earlyAccessPenalty =
        feeRule.early_access_penalty_perc_per_gap?.toNumber() ?? 0;
      const basePercentage = feeRule.base_percentage?.toNumber() ?? 0;
      const maxPercentage = feeRule.max_percentage?.toNumber() ?? Infinity;
      const baseFixedAmount = feeRule.base_fixed_amount?.toNumber() ?? 0;

      let dynamicPercentage =
        basePercentage + gapRatio * earlyAccessPenalty;
      dynamicPercentage = Math.min(dynamicPercentage, maxPercentage);

      const percentageFee = requestedAmount * (dynamicPercentage / 100);
      feeTotal = baseFixedAmount + percentageFee;
    }

    // Distribute fee according to BPS shares in Company model
    const platformFee = (feeTotal * company.fee_share_platform.toNumber()) / BPS_DENOMINATOR;
    const companyFee = (feeTotal * company.fee_share_company.toNumber()) / BPS_DENOMINATOR;
    const investorFee = (feeTotal * company.fee_share_investor.toNumber()) / BPS_DENOMINATOR;

    return {
      fee_total: feeTotal,
      platform_fee: platformFee,
      company_fee: companyFee,
      investor_fee: investorFee,
    };
  }
}
