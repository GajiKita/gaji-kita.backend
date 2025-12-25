import { IsString, IsNotEmpty, IsInt, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSmartContractDto {
  @ApiProperty({ example: 'GajiKita Main', description: 'Friendly name of the contract' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '0x123...', description: 'Contract address on the blockchain' })
  @IsString()
  @IsNotEmpty()
  contract_address: string;

  @ApiProperty({ example: 421614, description: 'Chain ID for the network (e.g., Arbitrum Sepolia)' })
  @IsInt()
  @IsNotEmpty()
  chain_id: number;

  @ApiProperty({ example: [], description: 'ABI as a JSON object' })
  @IsObject()
  @IsNotEmpty()
  abi: any;
}
