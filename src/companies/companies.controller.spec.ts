import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PinataService } from '../pinata/pinata.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: CompaniesService;
  let blockchainService: BlockchainService;
  let pinataService: PinataService;

  const mockCompaniesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updatePreferredToken: jest.fn(),
  };

  const mockBlockchainService = {
    encodeLockCompanyLiquidity: jest.fn().mockReturnValue('0xlock'),
    encodeWithdrawCompanyReward: jest.fn().mockReturnValue('0xwithdraw'),
    encodeSetCompanyPayoutToken: jest.fn().mockReturnValue('0xset'),
    getContractAddress: jest.fn().mockReturnValue('0xcontract'),
  };

  const mockPinataService = {
    pinJSON: jest.fn().mockResolvedValue('QmCID'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: PinataService, useValue: mockPinataService },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get<CompaniesService>(CompaniesService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    pinataService = module.get<PinataService>(PinataService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('prepareLockLiquidity', () => {
    it('should return transaction data and CID', async () => {
      const dto = { amount: 1000 };
      const result = await controller.prepareLockLiquidity(dto as any);
      expect(pinataService.pinJSON).toHaveBeenCalled();
      expect(blockchainService.encodeLockCompanyLiquidity).toHaveBeenCalled();
      expect(result).toHaveProperty('cid', 'QmCID');
      expect(result).toHaveProperty('data', '0xlock');
    });
  });

  describe('prepareWithdrawReward', () => {
    it('should return transaction data and CID', async () => {
      const dto = { amount: 500 };
      const result = await controller.prepareWithdrawReward(dto as any);
      expect(pinataService.pinJSON).toHaveBeenCalled();
      expect(blockchainService.encodeWithdrawCompanyReward).toHaveBeenCalled();
      expect(result).toHaveProperty('cid', 'QmCID');
      expect(result).toHaveProperty('data', '0xwithdraw');
    });
  });

  describe('updatePreferredToken', () => {
    it('should update DB and return transaction data', async () => {
      const id = 'comp123';
      const dto = { token_address: '0xtoken' };
      const result = await controller.updatePreferredToken(id, dto as any);
      expect(service.updatePreferredToken).toHaveBeenCalledWith(id, '0xtoken');
      expect(blockchainService.encodeSetCompanyPayoutToken).toHaveBeenCalled();
      expect(result).toHaveProperty('data', '0xset');
    });
  });
});
