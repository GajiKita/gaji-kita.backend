import { ApiProperty } from '@nestjs/swagger';

export class AccruedSalaryResponseDto {
    @ApiProperty({ example: 2500, description: 'Total salary accrued based on approved work logs' })
    accruedAmount: number;

    @ApiProperty({ example: 1000, description: 'Total amount already withdrawn in this cycle' })
    withdrawnAmount: number;

    @ApiProperty({ example: 1500, description: 'Remaining amount available for early access' })
    availableAmount: number;

    @ApiProperty({ example: 'pc-123-uuid', description: 'UUID of the current payroll cycle' })
    payrollCycleId: string;
}
