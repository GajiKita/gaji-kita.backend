import { IsUUID, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorklogDto {
  @ApiProperty({ example: 'e-789-uuid', description: 'The UUID of the employee' })
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({ example: 'pc-012-uuid', description: 'The UUID of the payroll cycle' })
  @IsUUID()
  @IsNotEmpty()
  payroll_cycle_id: string;

  @ApiProperty({ example: '2025-12-25', description: 'The date worked' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 8, description: 'Number of hours worked on this date' })
  @IsNumber()
  @IsNotEmpty()
  hours_worked: number;
}
