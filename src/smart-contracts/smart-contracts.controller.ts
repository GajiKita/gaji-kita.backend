import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SmartContractsService } from './smart-contracts.service';
import { CreateSmartContractDto } from './dto/create-smart-contract.dto';
import { UpdateSmartContractDto } from './dto/update-smart-contract.dto';
import { SmartContractResponseDto } from './dto/smart-contract-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('smart-contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
@Controller('smart-contracts')
export class SmartContractsController {
  constructor(private readonly smartContractsService: SmartContractsService) { }

  @Post()
  @ApiOperation({ summary: 'Create new smart contract metadata' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: SmartContractResponseDto })
  create(@Body() createSmartContractDto: CreateSmartContractDto) {
    return this.smartContractsService.create(createSmartContractDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all smart contract metadata' })
  @ApiResponse({ status: 200, description: 'Return list of smart contracts.', type: [SmartContractResponseDto] })
  findAll() {
    return this.smartContractsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get smart contract metadata by ID' })
  @ApiResponse({ status: 200, description: 'Return smart contract details.', type: SmartContractResponseDto })
  findOne(@Param('id') id: string) {
    return this.smartContractsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update smart contract metadata' })
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.', type: SmartContractResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateSmartContractDto: UpdateSmartContractDto,
  ) {
    return this.smartContractsService.update(id, updateSmartContractDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete smart contract metadata' })
  remove(@Param('id') id: string) {
    return this.smartContractsService.remove(id);
  }
}
