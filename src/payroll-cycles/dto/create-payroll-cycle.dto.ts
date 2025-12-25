import { IsUUID, IsDateString, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayrollCycleDto {
  @ApiProperty({ example: 'c-456-uuid', description: 'The UUID of the company this payroll cycle belongs to' })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ example: '2025-12-01', description: 'Start date of the payroll period' })
  @IsDateString()
  @IsNotEmpty()
  period_start: string;

  @ApiProperty({ example: '2025-12-31', description: 'End date of the payroll period' })
  @IsDateString()
  @IsNotEmpty()
  period_end: string;

  @ApiProperty({ example: '2026-01-05', description: 'Scheduled date for salary disbursement' })
  @IsDateString()
  @IsNotEmpty()
  payout_date: string;

  @ApiProperty({ example: 22, description: 'Total number of working days in this period' })
  @IsInt()
  @IsNotEmpty()
  total_working_days: number;
}
