import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponse {
  @ApiProperty({ example: '0x123...', description: 'The target contract address' })
  to: string;

  @ApiProperty({ example: '0x...', description: 'The encoded function call data (hex)' })
  data: string;

  @ApiProperty({ example: '0', description: 'The amount of native currency to send (in wei)', required: false })
  value?: string;
}
