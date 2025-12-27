import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from '@prisma/client';

class UserResponseDto {
    @ApiProperty({ example: 'u123-456', description: 'Internal user UUID' })
    id: string;

    @ApiProperty({ example: '0x123...', description: 'Wallet address of the user' })
    walletAddress: string;

    @ApiProperty({ enum: ROLES, example: ROLES.EMPLOYEE, description: 'Assigned role' })
    role: ROLES;
}

export class AuthResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT Access Token' })
    access_token: string;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}
