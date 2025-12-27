import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'u-123-uuid', description: 'The UUID of the user associated with this employee' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ example: 'c-456-uuid', description: 'The UUID of the company this employee belongs to' })
  @IsUUID()
  company_id: string;

  @ApiProperty({ example: 'EMP001', description: 'Internal employee identification number', required: false })
  @IsString()
  @IsOptional()
  employee_number?: string;

  @ApiProperty({ example: 'Software Engineer', description: 'Job title or position', required: false })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({ example: 5000, description: 'Base monthly salary of the employee' })
  @IsNumber()
  base_salary: number;

  @ApiProperty({ example: '0x123abc...', description: 'Wallet address for payroll disbursement' })
  @IsString()
  @IsNotEmpty()
  wallet_address: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Current employment status', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'tokenId-789', description: 'ID of the Soulbound Token (SBT) assigned to the employee', required: false })
  @IsString()
  @IsOptional()
  sbt_token_id?: string;

  @ApiProperty({ example: '2023-01-01', description: 'Employment start date', required: false })
  @IsDateString()
  @IsOptional()
  employed_started?: Date;

  @ApiProperty({ example: '2025-12-31', description: 'Employment end date', required: false })
  @IsDateString()
  @IsOptional()
  employed_ended?: Date;
}
