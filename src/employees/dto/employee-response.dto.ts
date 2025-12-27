import { ApiProperty } from '@nestjs/swagger';

export class EmployeeResponseDto {
    @ApiProperty({ example: 'e-789-uuid', description: 'Internal employee UUID' })
    id: string;

    @ApiProperty({ example: 'u-123-uuid', description: 'User UUID' })
    user_id: string;

    @ApiProperty({ example: 'c-456-uuid', description: 'Company UUID' })
    company_id: string;

    @ApiProperty({ example: 'EMP001', description: 'Employee identifier' })
    employee_number: string;

    @ApiProperty({ example: 'Software Engineer', description: 'Job title' })
    position: string;

    @ApiProperty({ example: 5000, description: 'Base monthly salary' })
    base_salary: number;

    @ApiProperty({ example: '0x123abc...', description: 'Wallet address' })
    wallet_address: string;

    @ApiProperty({ example: 'ACTIVE', description: 'Status' })
    status: string;

    @ApiProperty({ example: '2023-01-01', description: 'Start date' })
    employed_started: Date;
}
