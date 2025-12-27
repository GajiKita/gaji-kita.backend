import { Test, TestingModule } from '@nestjs/testing';
import { WorklogsService } from './worklogs.service';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('WorklogsService', () => {
  let service: WorklogsService;
  let prisma: PrismaService;
  let blockchainService: BlockchainService;
  let auditLogsService: AuditLogsService;

  const mockPrismaService = {
    employeeWorkLog: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    withdrawLimit: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockBlockchainService = {
    encodeUpdateEmployeeDaysWorked: jest.fn().mockReturnValue('0xsync'),
    getContractAddress: jest.fn().mockReturnValue('0xcontract'),
  };

  const mockAuditLogsService = {
    log: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorklogsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get<WorklogsService>(WorklogsService);
    prisma = module.get<PrismaService>(PrismaService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    auditLogsService = module.get<AuditLogsService>(AuditLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check in', async () => {
    await service.checkIn('e1', 'pc1');
    expect(prisma.employeeWorkLog.create).toHaveBeenCalled();
  });

  it('should check out', async () => {
    await service.checkOut('wl1', 8);
    expect(prisma.employeeWorkLog.update).toHaveBeenCalledWith({
      where: { id: 'wl1' },
      data: { hours_worked: 8 },
    });
  });

  describe('approve', () => {
    it('should approve worklog and update limits', async () => {
      const worklog = {
        id: 'wl1',
        employee_id: 'e1',
        payroll_cycle_id: 'pc1',
        hours_worked: new Decimal(8),
        employee: { id: 'e1', base_salary: new Decimal(10000), wallet_address: '0xemp' },
        payroll_cycle: { id: 'pc1', total_working_days: 20 },
      };
      mockPrismaService.employeeWorkLog.update.mockResolvedValue(worklog);
      mockPrismaService.employeeWorkLog.count.mockResolvedValue(5);
      mockPrismaService.withdrawLimit.findUnique.mockResolvedValue({ used_amount: new Decimal(0) });
      mockPrismaService.withdrawLimit.upsert.mockResolvedValue({ id: 'lim1' });

      const result = await service.approve('wl1', 'app1');

      expect(prisma.employeeWorkLog.update).toHaveBeenCalled();
      expect(prisma.withdrawLimit.upsert).toHaveBeenCalled();
      expect(blockchainService.encodeUpdateEmployeeDaysWorked).toHaveBeenCalled();
      expect(auditLogsService.log).toHaveBeenCalled();
      expect(result).toHaveProperty('blockchainSync');
    });
  });
});
