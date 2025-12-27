import { ApiProperty } from '@nestjs/swagger';

export class WorklogSyncResponseDto {
    @ApiProperty({ example: 'w-123-uuid', description: 'Internal worklog UUID' })
    id: string;

    @ApiProperty({ example: 'APPROVED', description: 'Status after the operation' })
    status: string;

    @ApiProperty({ example: '0xabc...', description: 'Hex encoded data for blockchain synchronization' })
    hexSyncData: string;

    @ApiProperty({ example: '0x123...', description: 'Target contract address' })
    contractAddress: string;
}
