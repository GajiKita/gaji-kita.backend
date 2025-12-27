import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsService } from './investors.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('InvestorsService', () => {
  let service: InvestorsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    investor: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestorsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InvestorsService>(InvestorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an investor', async () => {
    const dto = { user_id: 'u1', wallet_address: '0xinv' };
    await service.create(dto as any);
    expect(prisma.investor.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should find all investors', async () => {
    await service.findAll();
    expect(prisma.investor.findMany).toHaveBeenCalledWith({
      where: { deleted: false },
      include: { user: true },
    });
  });

  it('should find one investor', async () => {
    const id = '123';
    mockPrismaService.investor.findUnique.mockResolvedValue({ id });
    const result = await service.findOne(id);
    expect(result).toEqual({ id });
  });

  it('should throw NotFoundException if investor not found', async () => {
    mockPrismaService.investor.findUnique.mockResolvedValue(null);
    await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
  });
});
