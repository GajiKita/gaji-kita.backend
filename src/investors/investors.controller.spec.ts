import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsController } from './investors.controller';
import { InvestorsService } from './investors.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PinataService } from '../pinata/pinata.service';

describe('InvestorsController', () => {
  let controller: InvestorsController;
  let service: InvestorsService;
  let blockchainService: BlockchainService;
  let pinataService: PinataService;

  const mockInvestorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updatePreferredToken: jest.fn(),
  };

  const mockBlockchainService = {
    encodeDepositInvestorLiquidity: jest.fn().mockReturnValue('0xdeposit'),
    encodeWithdrawInvestorReward: jest.fn().mockReturnValue('0xwithdraw'),
    getContractAddress: jest.fn().mockReturnValue('0xcontract'),
  };

  const mockPinataService = {
    pinJSON: jest.fn().mockResolvedValue('QmCID'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestorsController],
      providers: [
        { provide: InvestorsService, useValue: mockInvestorsService },
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: PinataService, useValue: mockPinataService },
      ],
    }).compile();

    controller = module.get<InvestorsController>(InvestorsController);
    service = module.get<InvestorsService>(InvestorsService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    pinataService = module.get<PinataService>(PinataService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('prepareDepositLiquidity', () => {
    it('should return transaction data and CID', async () => {
      const dto = { amount: 1000 };
      const result = await controller.prepareDepositLiquidity(dto as any);
      expect(pinataService.pinJSON).toHaveBeenCalled();
      expect(blockchainService.encodeDepositInvestorLiquidity).toHaveBeenCalled();
      expect(result).toHaveProperty('cid', 'QmCID');
      expect(result).toHaveProperty('data', '0xdeposit');
    });
  });

  describe('prepareWithdrawReward', () => {
    it('should return transaction data and CID', async () => {
      const dto = { amount: 500 };
      const result = await controller.prepareWithdrawReward(dto as any);
      expect(pinataService.pinJSON).toHaveBeenCalled();
      expect(blockchainService.encodeWithdrawInvestorReward).toHaveBeenCalled();
      expect(result).toHaveProperty('cid', 'QmCID');
      expect(result).toHaveProperty('data', '0xwithdraw');
    });
  });
});
