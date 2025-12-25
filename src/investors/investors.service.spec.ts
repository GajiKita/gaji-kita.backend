import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsService } from './investors.service';
import { PrismaService } from '../prisma/prisma.service';

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

  describe('create', () => {
    it('should create an investor', async () => {
      const dto = { user_id: '1', wallet_address: '0x123' };
      mockPrismaService.investor.create.mockResolvedValue(dto);
      expect(await service.create(dto)).toEqual(dto);
      expect(mockPrismaService.investor.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all investors', async () => {
      const investors = [{ id: '1', wallet_address: '0x123' }];
      mockPrismaService.investor.findMany.mockResolvedValue(investors);
      expect(await service.findAll()).toEqual(investors);
    });
  });
});
