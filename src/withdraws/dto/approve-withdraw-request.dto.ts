import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveWithdrawRequestDto {
  @ApiProperty({ example: 1000, description: 'The final amount approved for withdrawal' })
  @IsNumber()
  approved_amount: number;

  @ApiProperty({ example: 50, description: 'Optional extra fee (e.g. for urgent AAVE liquidation)', required: false })
  @IsNumber()
  @IsOptional()
  extra_aave_fee?: number;
}
