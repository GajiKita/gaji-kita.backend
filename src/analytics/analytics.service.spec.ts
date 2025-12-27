import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: { count: jest.fn().mockResolvedValue(10) },
    company: { count: jest.fn().mockResolvedValue(5) },
    withdrawRequest: { 
      count: jest.fn().mockResolvedValue(20),
      aggregate: jest.fn()
    },
    employee: { 
      findFirst: jest.fn(),
      count: jest.fn().mockResolvedValue(15)
    },
    employeeWorkLog: { count: jest.fn().mockResolvedValue(2) },
    investor: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get admin stats', async () => {
    mockPrismaService.withdrawRequest.aggregate.mockResolvedValue({
      _sum: { fee_total_amount: new Decimal(100) }
    });
    const stats = await service.getAdminStats();
    expect(stats.totalUsers).toBe(10);
    expect(stats.totalFeesPlatform).toBe(100);
  });

  it('should get HR stats', async () => {
    mockPrismaService.employee.findFirst.mockResolvedValue({ company_id: 'c1' });
    mockPrismaService.withdrawRequest.aggregate.mockResolvedValue({
      _sum: { requested_amount: new Decimal(1000) }
    });
    mockPrismaService.employeeWorkLog.count.mockResolvedValue(2);
    mockPrismaService.employee.count.mockResolvedValue(15);

    const stats = await service.getHRStats('u1');
    expect(stats!.totalEmployees).toBe(15);
    expect(stats!.pendingWorklogs).toBe(2);
    expect(stats!.totalWithdrawals).toBe(1000);
  });

  it('should get investor stats', async () => {
    mockPrismaService.investor.findFirst.mockResolvedValue({
      deposited_amount: new Decimal(5000),
      reward_balance: new Decimal(50),
      withdrawn_rewards: new Decimal(10),
    });
    const stats = await service.getInvestorStats('u1');
    expect(stats!.depositedAmount).toBe(5000);
    expect(stats!.rewardBalance).toBe(50);
    expect(stats!.withdrawnRewards).toBe(10);
  });

  it('should return null if HR employee not found', async () => {
    mockPrismaService.employee.findFirst.mockResolvedValue(null);
    const stats = await service.getHRStats('u1');
    expect(stats).toBeNull();
  });

  it('should return null if investor not found', async () => {
    mockPrismaService.investor.findFirst.mockResolvedValue(null);
    const stats = await service.getInvestorStats('u1');
    expect(stats).toBeNull();
  });
});
