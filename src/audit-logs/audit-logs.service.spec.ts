import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an audit log', async () => {
    const data = { action: 'TEST', entity: 'TestEntity' };
    await service.log(data);
    expect(prisma.auditLog.create).toHaveBeenCalledWith({ data });
  });

  it('should find all logs with filters', async () => {
    const query = { userId: 'u1', action: 'SIGN_IN' };
    await service.findAll(query);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { user_id: 'u1', action: 'SIGN_IN', entity: undefined }
    }));
  });
});
