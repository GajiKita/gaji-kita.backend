import { ApiProperty } from '@nestjs/swagger';

export class AuditLogResponseDto {
    @ApiProperty({ example: 'log-123-uuid', description: 'Internal log UUID' })
    id: string;

    @ApiProperty({ example: 'u-456-uuid', description: 'User UUID who performed the action' })
    user_id: string;

    @ApiProperty({ example: 'WithdrawRequest', description: 'Target entity' })
    entity: string;

    @ApiProperty({ example: 'EXECUTE', description: 'Action performed' })
    action: string;

    @ApiProperty({ example: 'Approved withdrawal for EMP001', description: 'Human readable details' })
    details: string;

    @ApiProperty({ example: '2023-10-27T10:00:00Z', description: 'Timestamp' })
    created_at: Date;
}
