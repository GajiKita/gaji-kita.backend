import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawsService } from './withdraws.service';
import { PrismaService } from '../prisma/prisma.service';
import { FeesService } from '../fees/fees.service';
import { PinataService } from '../pinata/pinata.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WITHDRAW_STATUS } from '@prisma/client';

describe('WithdrawsService', () => {
  let service: WithdrawsService;
  let prisma: PrismaService;
  let feesService: FeesService;
  let pinataService: PinataService;

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
    calculateFee: jest.fn().mockResolvedValue({
      fee_total: 10,
      company_fee: 2,
      platform_fee: 7,
      investor_fee: 1,
    }),
  };

  const mockPinataService = {
    pinJSON: jest.fn().mockResolvedValue('QmCID'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FeesService, useValue: mockFeesService },
        { provide: PinataService, useValue: mockPinataService },
      ],
    }).compile();

    service = module.get<WithdrawsService>(WithdrawsService);
    prisma = module.get<PrismaService>(PrismaService);
    feesService = module.get<FeesService>(FeesService);
    pinataService = module.get<PinataService>(PinataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('simulate', () => {
    it('should return simulation data', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue({ company_id: 'c1' });
      mockPrismaService.payrollCycle.findUnique.mockResolvedValue({ total_working_days: 20 });
      mockPrismaService.withdrawLimit.findUnique.mockResolvedValue({ remaining_amount: { toNumber: () => 5000 } });
      mockPrismaService.employeeWorkLog.count.mockResolvedValue(10);

      const result = await service.simulate('e1', 'pc1', 1000);

      expect(result).toHaveProperty('max_possible_withdraw', 5000);
      expect(result).toHaveProperty('fee_total', 10);
    });

    it('should throw BadRequestException if amount exceeds limit', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue({ company_id: 'c1' });
      mockPrismaService.payrollCycle.findUnique.mockResolvedValue({ total_working_days: 20 });
      mockPrismaService.withdrawLimit.findUnique.mockResolvedValue({ remaining_amount: { toNumber: () => 500 } });

      await expect(service.simulate('e1', 'pc1', 1000)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createRequest', () => {
    it('should create a request and pin it to IPFS', async () => {
      const dto = { employee_id: 'e1', payroll_cycle_id: 'pc1', requested_amount: 1000 };
      mockPrismaService.employee.findUnique.mockResolvedValue({ user: { wallet_address: '0x123' } });
      mockPrismaService.withdrawRequest.create.mockResolvedValue({ id: 'req1', ipfs_cid: 'QmCID' });

      const result = await service.createRequest(dto as any);

      expect(pinataService.pinJSON).toHaveBeenCalled();
      expect(prisma.withdrawRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ ipfs_cid: 'QmCID' }),
      });
      expect(result.id).toBe('req1');
    });
  });
});
