import { IsUUID, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWithdrawRequestDto {
  @ApiProperty({ example: 'e-789-uuid', description: 'The UUID of the employee submitting the request' })
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({ example: 'pc-012-uuid', description: 'The UUID of the payroll cycle' })
  @IsUUID()
  @IsNotEmpty()
  payroll_cycle_id: string;

  @ApiProperty({ example: 1000, description: 'The amount requested for early access' })
  @IsNumber()
  @IsNotEmpty()
  requested_amount: number;
}
