import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    employee: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an employee', async () => {
    const dto = { user_id: 'u1', company_id: 'c1', base_salary: 1000, wallet_address: '0xemp' };
    await service.create(dto as any);
    expect(prisma.employee.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should find all employees with optional companyId', async () => {
    await service.findAll('c1');
    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      where: { company_id: 'c1', deleted: false },
      include: {
        user: {
          select: {
            id: true,
            wallet_address: true,
            email: true,
            role: true,
          }
        }
      },
    });
  });

  it('should findByCompanyId', async () => {
    await service.findByCompanyId('c1');
    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      where: { company_id: 'c1', deleted: false },
      include: {
        user: {
          select: {
            id: true,
            wallet_address: true,
            email: true,
            role: true,
          }
        }
      },
    });
  });

  it('should findCompanyByUserId', async () => {
    mockPrismaService.employee.findFirst.mockResolvedValue({ company_id: 'c1' });
    const result = await service.findCompanyByUserId('u1');
    expect(result).toBe('c1');
  });
});
