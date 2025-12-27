import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsResponseDto {
    @ApiProperty({ example: 150, description: 'Total registered users' })
    totalUsers: number;

    @ApiProperty({ example: 25, description: 'Total registered companies' })
    totalCompanies: number;

    @ApiProperty({ example: 1200, description: 'Total withdrawal requests processed' })
    totalWithdrawRequests: number;

    @ApiProperty({ example: 15000, description: 'Total fees collected by the platform' })
    totalFeesPlatform: number;
}

export class HRStatsResponseDto {
    @ApiProperty({ example: 45, description: 'Total employees in the company' })
    totalEmployees: number;

    @ApiProperty({ example: 8, description: 'Number of work logs pending approval' })
    pendingWorklogs: number;

    @ApiProperty({ example: 8500, description: 'Total amount withdrawn by company employees' })
    totalWithdrawals: number;
}

export class InvestorStatsResponseDto {
    @ApiProperty({ example: 25000, description: 'Total amount deposited across all pools' })
    depositedAmount: number;

    @ApiProperty({ example: 450, description: 'Current available reward balance' })
    rewardBalance: number;

    @ApiProperty({ example: 1200, description: 'Total rewards already withdrawn' })
    withdrawnRewards: number;
}
