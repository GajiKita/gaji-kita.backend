import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawsService } from './withdraws.service';
import { PrismaService } from '../prisma/prisma.service';
import { FeesService } from '../fees/fees.service';

describe('WithdrawsService', () => {
  let service: WithdrawsService;
  let prisma: PrismaService;
  let feesService: FeesService;

  const mockPrismaService = {
    employee: { findUnique: jest.fn() },
    payrollCycle: { findUnique: jest.fn() },
    withdrawLimit: { findUnique: jest.fn(), update: jest.fn() },
    employeeWorkLog: { count: jest.fn() },
    withdrawRequest: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    companyLockPool: { findFirst: jest.fn(), update: jest.fn() },
    investor: { findFirst: jest.fn(), update: jest.fn() },
    company: { update: jest.fn() },
  };

  const mockFeesService = {
    calculateFee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FeesService, useValue: mockFeesService },
      ],
    }).compile();

    service = module.get<WithdrawsService>(WithdrawsService);
    prisma = module.get<PrismaService>(PrismaService);
    feesService = module.get<FeesService>(FeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // More complex tests for execute() can be added here
});
