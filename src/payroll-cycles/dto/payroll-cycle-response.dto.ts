import { ApiProperty } from '@nestjs/swagger';

export class PayrollCycleResponseDto {
    @ApiProperty({ example: 'pc-123-uuid', description: 'Internal cycle UUID' })
    id: string;

    @ApiProperty({ example: 'c-456-uuid', description: 'Company UUID' })
    company_id: string;

    @ApiProperty({ example: '2023-10-01', description: 'Start date' })
    start_date: Date;

    @ApiProperty({ example: '2023-10-31', description: 'End date' })
    end_date: Date;

    @ApiProperty({ example: 22, description: 'Total working days in this cycle' })
    total_working_days: number;

    @ApiProperty({ example: true, description: 'Is current active cycle' })
    is_active: boolean;
}
