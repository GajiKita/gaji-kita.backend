import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: '0x123...', description: 'Wallet address of the user' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ example: '0xabc...', description: 'Signature of the message' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ example: 'I register as EMPLOYEE on Kam, 25 Desember 2025 20:40', description: 'The signed message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email address (optional)' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: [ROLES.EMPLOYEE, ROLES.INVESTOR], description: 'User role (required: EMPLOYEE or INVESTOR)' })
  @IsEnum(ROLES)
  @IsNotEmpty()
  role: ROLES;
}
