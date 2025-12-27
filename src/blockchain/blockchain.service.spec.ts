import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock viem components
jest.mock('viem', () => ({
  createPublicClient: jest.fn().mockReturnValue({
    readContract: jest.fn(),
  }),
  http: jest.fn(),
  parseAbi: jest.fn().mockReturnValue([]),
  encodeFunctionData: jest.fn().mockReturnValue('0xhex'),
}));

describe('BlockchainService', () => {
  let service: BlockchainService;
  let prisma: PrismaService;

  const mockPrismaService = {
    supportedToken: { findMany: jest.fn(), upsert: jest.fn(), update: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encode withdrawSalary', () => {
    const result = service.encodeWithdrawSalary('QmCID');
    expect(result).toBe('0xhex');
  });

  it('should return contract address', () => {
    expect(service.getContractAddress()).toBeDefined();
  });
});
