import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'PT. Teknologi Maju', description: 'The official name of the company' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 1, Jakarta', description: 'The physical address of the company', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 30, description: 'Minimum percentage of total payroll that must be locked in the pool' })
  @IsNumber()
  min_lock_percentage: number;

  @ApiProperty({ example: 2000, description: 'Percentage share for the company from withdrawal fees (in BPS, 2000 = 20%)' })
  @IsNumber()
  fee_share_company: number;

  @ApiProperty({ example: 8000, description: 'Percentage share for the platform from withdrawal fees (in BPS, 8000 = 80%)' })
  @IsNumber()
  fee_share_platform: number;
}
