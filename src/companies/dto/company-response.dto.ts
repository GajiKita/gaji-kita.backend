import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
    @ApiProperty({ example: 'c-456-uuid', description: 'Internal company UUID' })
    id: string;

    @ApiProperty({ example: 'PT. Teknologi Maju', description: 'The official name of the company' })
    name: string;

    @ApiProperty({ example: 'Jl. Merdeka No. 1, Jakarta', description: 'The physical address' })
    address: string;

    @ApiProperty({ example: 30, description: 'Minimum percentage of total payroll that must be locked' })
    min_lock_percentage: number;

    @ApiProperty({ example: 2000, description: 'Company share from withdrawal fees in BPS' })
    fee_share_company: number;

    @ApiProperty({ example: 8000, description: 'Platform share from withdrawal fees in BPS' })
    fee_share_platform: number;

    @ApiProperty({ example: 100.5, description: 'Current reward balance available for withdrawal' })
    reward_balance: number;

    @ApiProperty({ example: '0x123abc...', description: 'Preferred payout token address' })
    preferred_payout_token: string;

    @ApiProperty({ example: '2023-10-27T10:00:00Z', description: 'Creation date' })
    created_at: Date;
}
