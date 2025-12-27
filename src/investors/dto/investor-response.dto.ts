import { ApiProperty } from '@nestjs/swagger';

export class InvestorResponseDto {
    @ApiProperty({ example: 'inv-123-uuid', description: 'Internal investor UUID' })
    id: string;

    @ApiProperty({ example: 'u-789-uuid', description: 'User UUID' })
    user_id: string;

    @ApiProperty({ example: '0xabc123...', description: 'Wallet address' })
    wallet_address: string;

    @ApiProperty({ example: 50000, description: 'Total deposited amount' })
    deposited_amount: number;

    @ApiProperty({ example: 150.75, description: 'Available reward balance' })
    reward_balance: number;

    @ApiProperty({ example: '0x123abc...', description: 'Preferred payout token' })
    preferred_payout_token: string;
}
