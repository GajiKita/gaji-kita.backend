import { ApiProperty } from '@nestjs/swagger';

export class SimulationResponseDto {
    @ApiProperty({ example: 5000, description: 'Maximum amount the employee can currently withdraw' })
    max_possible_withdraw: number;

    @ApiProperty({ example: 1000, description: 'The requested withdrawal amount' })
    requested_amount: number;

    @ApiProperty({ example: 50, description: 'Total fee calculated for this withdrawal' })
    fee_total: number;

    @ApiProperty({ example: 10, description: 'Fee share for the company' })
    company_fee: number;

    @ApiProperty({ example: 35, description: 'Fee share for the platform' })
    platform_fee: number;

    @ApiProperty({ example: 5, description: 'Fee share for liquidity investors' })
    investor_fee: number;

    @ApiProperty({ example: 950, description: 'Final amount the employee will receive' })
    net_amount: number;
}
