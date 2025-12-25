import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: '0x123...', description: 'Wallet address of the user' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ example: '0xabc...', description: 'Signature of the message' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ example: 'Sign this message to login', description: 'The signed message' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
