import { Test, TestingModule } from '@nestjs/testing';
import { PayrollCyclesService } from './payroll-cycles.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('PayrollCyclesService', () => {
  let service: PayrollCyclesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    company: { findUnique: jest.fn() },
    payrollCycle: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollCyclesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PayrollCyclesService>(PayrollCyclesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create cycle and lock pool with correct amounts', async () => {
      const company = {
        id: 'c1',
        min_lock_percentage: new Decimal(20),
        employees: [
          { base_salary: new Decimal(1000) },
          { base_salary: new Decimal(2000) },
        ],
      };
      mockPrismaService.company.findUnique.mockResolvedValue(company);
      mockPrismaService.payrollCycle.create.mockResolvedValue({ id: 'pc1' });

      const dto = {
        company_id: 'c1',
        period_start: new Date(),
        period_end: new Date(),
        payout_date: new Date(),
        total_working_days: 20,
      };

      await service.create(dto as any);

      expect(prisma.payrollCycle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          company_lock_pools: {
            create: expect.objectContaining({
              required_locked_amount: 600, // (1000+2000) * 0.2
            }),
          },
        }),
        include: { company_lock_pools: true },
      });
    });
  });
});
