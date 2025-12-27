import { ApiProperty } from '@nestjs/swagger';

export class WithdrawRequestResponseDto {
    @ApiProperty({ example: 'wr-123-uuid', description: 'Internal request UUID' })
    id: string;

    @ApiProperty({ example: 'e-789-uuid', description: 'Employee UUID' })
    employee_id: string;

    @ApiProperty({ example: 'pc-123-uuid', description: 'Payroll cycle UUID' })
    payroll_cycle_id: string;

    @ApiProperty({ example: 1000, description: 'Requested amount' })
    requested_amount: number;

    @ApiProperty({ example: 'PAID', description: 'Status' })
    status: string;

    @ApiProperty({ example: '0xhash...', description: 'Blockchain transaction hash' })
    tx_hash: string;

    @ApiProperty({ example: 'Qm...', description: 'IPFS CID for metadata' })
    ipfs_cid: string;
}
