import { IsUUID, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SimulateWithdrawDto {
  @ApiProperty({ example: 'e-789-uuid', description: 'The UUID of the employee making the withdrawal' })
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({ example: 'pc-012-uuid', description: 'The UUID of the current active payroll cycle' })
  @IsUUID()
  @IsNotEmpty()
  payroll_cycle_id: string;

  @ApiProperty({ example: 1000, description: 'The amount the employee wants to withdraw' })
  @IsNumber()
  @IsNotEmpty()
  requested_amount: number;
}
