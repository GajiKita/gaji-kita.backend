import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvestorDto {
  @ApiProperty({ example: 'u-123-uuid', description: 'The UUID of the user associated with this investor' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: '0x123...', description: 'Wallet address for receiving rewards' })
  @IsString()
  @IsNotEmpty()
  wallet_address: string;

  @ApiProperty({ example: 'USDC', description: 'Preferred token for reward payouts', required: false })
  @IsString()
  @IsOptional()
  preferred_payout_token?: string;
}
