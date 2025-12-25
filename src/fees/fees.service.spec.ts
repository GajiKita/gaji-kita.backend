import { Test, TestingModule } from '@nestjs/testing';
import { FeesService } from './fees.service';
import { PrismaService } from '../prisma/prisma.service';
import { FEE_MODE } from '@prisma/client';

describe('FeesService', () => {
  let service: FeesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    withdrawFeeRule: {
      findUnique: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
    },
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

  describe('calculateFee', () => {
    it('should calculate percentage fee correctly', async () => {
      const companyId = 'co1';
      const requestedAmount = 1000;
      const progressRatio = 0.5;

      mockPrismaService.withdrawFeeRule.findUnique.mockResolvedValue({
        fee_mode: FEE_MODE.PERCENTAGE,
        base_percentage: { toNumber: () => 1 },
        early_access_penalty_perc_per_gap: { toNumber: () => 2 },
        max_percentage: { toNumber: () => 10 },
      });

      mockPrismaService.company.findUnique.mockResolvedValue({
        id: companyId,
        fee_share_platform: { toNumber: () => 8000 },
        fee_share_company: { toNumber: () => 2000 },
        fee_share_investor: { toNumber: () => 0 },
      });

      const result = await service.calculateFee(companyId, requestedAmount, progressRatio);
      
      // gapRatio = 0.5
      // dynamicPercentage = 1 + 0.5 * 2 = 2%
      // feeTotal = 1000 * 0.02 = 20
      // platformFee = 20 * 0.8 = 16
      // companyFee = 20 * 0.2 = 4
      
      expect(result.fee_total).toBe(20);
      expect(result.platform_fee).toBe(16);
      expect(result.company_fee).toBe(4);
    });
  });
});
