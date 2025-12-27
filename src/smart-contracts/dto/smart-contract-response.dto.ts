import { ApiProperty } from '@nestjs/swagger';

export class SmartContractResponseDto {
    @ApiProperty({ example: 'sc-123-uuid', description: 'Internal record UUID' })
    id: string;

    @ApiProperty({ example: 'Main Pool', description: 'Contract name' })
    name: string;

    @ApiProperty({ example: '0x123abc...', description: 'Contract address' })
    address: string;

    @ApiProperty({ example: '1.0.0', description: 'Version' })
    version: string;

    @ApiProperty({ example: true, description: 'Is current active contract' })
    is_active: boolean;

    @ApiProperty({ example: 'Arbitrum Sepolia', description: 'Network name' })
    network: string;
}
