import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrepareTransactionDto {
  @ApiProperty({ example: 1000, description: 'The amount for the transaction' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'cid-123', description: 'Context identifier or receipt ID' })
  @IsString()
  @IsNotEmpty()
  cid: string;
}
