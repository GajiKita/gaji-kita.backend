import { ApiProperty } from '@nestjs/swagger';

export class WorklogResponseDto {
    @ApiProperty({ example: 'w-123-uuid', description: 'Internal worklog UUID' })
    id: string;

    @ApiProperty({ example: 'e-789-uuid', description: 'Employee UUID' })
    employee_id: string;

    @ApiProperty({ example: 'pc-123-uuid', description: 'Payroll cycle UUID' })
    payroll_cycle_id: string;

    @ApiProperty({ example: '2023-10-27', description: 'Work date' })
    work_date: Date;

    @ApiProperty({ example: 8, description: 'Hours worked' })
    hours_worked: number;

    @ApiProperty({ example: 'APPROVED', description: 'Status' })
    status: string;

    @ApiProperty({ example: 'hr-123-uuid', description: 'UUID of the HR who approved' })
    approved_by_id: string;
}
