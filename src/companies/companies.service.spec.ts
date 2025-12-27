import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    company: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a company', async () => {
    const dto = { name: 'Test', min_lock_percentage: 10 };
    await service.create(dto as any);
    expect(prisma.company.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should find all companies', async () => {
    await service.findAll();
    expect(prisma.company.findMany).toHaveBeenCalledWith({ where: { deleted: false } });
  });

  it('should find one company', async () => {
    const id = '123';
    await service.findOne(id);
    expect(prisma.company.findUnique).toHaveBeenCalledWith({ where: { id } });
  });

  it('should update a company', async () => {
    const id = '123';
    const dto = { name: 'Updated' };
    await service.update(id, dto as any);
    expect(prisma.company.update).toHaveBeenCalledWith({
      where: { id },
      data: dto,
    });
  });

  it('should remove a company (soft delete)', async () => {
    const id = '123';
    await service.remove(id);
    expect(prisma.company.update).toHaveBeenCalledWith({
      where: { id },
      data: { deleted: true },
    });
  });
});
