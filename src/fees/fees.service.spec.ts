import { Test, TestingModule } from '@nestjs/testing';
import { FeesService } from './fees.service';
import { PrismaService } from '../prisma/prisma.service';
import { FEE_MODE } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('FeesService', () => {
  let service: FeesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    withdrawFeeRule: { findUnique: jest.fn() },
    company: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FeesService>(FeesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate percentage fee correctly', async () => {
    mockPrismaService.withdrawFeeRule.findUnique.mockResolvedValue({
      fee_mode: FEE_MODE.PERCENTAGE,
      base_percentage: new Decimal(2),
      early_access_penalty_perc_per_gap: new Decimal(1),
      max_percentage: new Decimal(5),
    });
    mockPrismaService.company.findUnique.mockResolvedValue({
      fee_share_platform: new Decimal(7000), // 70%
      fee_share_company: new Decimal(2000), // 20%
      fee_share_investor: new Decimal(1000), // 10%
    });

    const result = await service.calculateFee('c1', 1000, 0.5); // gapRatio = 0.5

    // 2 + 0.5 * 1 = 2.5%
    // 1000 * 0.025 = 25
    expect(result.fee_total).toBe(25);
    expect(result.platform_fee).toBe(17.5);
    expect(result.company_fee).toBe(5);
    expect(result.investor_fee).toBe(2.5);
  });
});
