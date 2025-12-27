import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('PayrollService', () => {
  let service: PayrollService;
  let prisma: PrismaService;

  const mockPrismaService = {
    employee: { findFirst: jest.fn() },
    employeeWorkLog: { count: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyAccruedSalary', () => {
    it('should calculate accrued salary correctly', async () => {
      const now = new Date();
      const employee = {
        id: 'e1',
        base_salary: new Decimal(10000),
        company: {
          payroll_cycles: [
            {
              id: 'pc1',
              total_working_days: 20,
              period_start: now,
              period_end: now,
            },
          ],
        },
      };
      mockPrismaService.employee.findFirst.mockResolvedValue(employee);
      mockPrismaService.employeeWorkLog.count.mockResolvedValue(10);

      const result = await service.getMyAccruedSalary('u1');

      expect(result.accruedAmount).toBe(5000);
      expect(result.daysWorked).toBe(10);
      expect(result.totalCycleDays).toBe(20);
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockPrismaService.employee.findFirst.mockResolvedValue(null);
      await expect(service.getMyAccruedSalary('u1')).rejects.toThrow(NotFoundException);
    });

    it('should return 0 if no active cycle found', async () => {
      const employee = {
        id: 'e1',
        company: { payroll_cycles: [] },
      };
      mockPrismaService.employee.findFirst.mockResolvedValue(employee);
      const result = await service.getMyAccruedSalary('u1');
      expect(result.accruedAmount).toBe(0);
      expect(result.message).toBeDefined();
    });
  });
});
