import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('blockchain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('supported-tokens')
  @ApiOperation({ summary: 'Get list of supported payout stablecoins' })
  @ApiResponse({ status: 200, description: 'Return list of tokens from database.' })
  async getSupportedTokens() {
    return this.blockchainService.getSupportedPayoutTokens();
  }

  @Post('sync-tokens')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Manually sync supported tokens from blockchain' })
  @ApiResponse({ status: 200, description: 'Sync completed successfully.' })
  async syncTokens() {
    return this.blockchainService.syncSupportedTokens();
  }
}
