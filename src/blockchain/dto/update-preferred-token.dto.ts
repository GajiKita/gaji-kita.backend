import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferredTokenDto {
  @ApiProperty({ example: '0x...', description: 'The address of the preferred stablecoin' })
  @IsString()
  @IsNotEmpty()
  token_address: string;
}
