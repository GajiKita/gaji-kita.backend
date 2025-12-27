import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawsController } from './withdraws.controller';
import { WithdrawsService } from './withdraws.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ForbiddenException } from '@nestjs/common';

describe('WithdrawsController', () => {
  let controller: WithdrawsController;
  let service: WithdrawsService;
  let blockchainService: BlockchainService;

  const mockWithdrawsService = {
    simulate: jest.fn(),
    createRequest: jest.fn(),
    execute: jest.fn(),
  };

  const mockBlockchainService = {
    encodeWithdrawSalary: jest.fn().mockReturnValue('0xhex'),
    getContractAddress: jest.fn().mockReturnValue('0xcontract'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawsController],
      providers: [
        { provide: WithdrawsService, useValue: mockWithdrawsService },
        { provide: BlockchainService, useValue: mockBlockchainService },
      ],
    }).compile();

    controller = module.get<WithdrawsController>(WithdrawsController);
    service = module.get<WithdrawsService>(WithdrawsService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRequest', () => {
    it('should return transaction data including CID', async () => {
      const dto = { employee_id: 'e1', payroll_cycle_id: 'pc1', requested_amount: 1000 };
      const req = { user: { id: 'e1' } };
      mockWithdrawsService.createRequest.mockResolvedValue({
        id: 'req1',
        ipfs_cid: 'QmCID',
      });

      const result = await controller.createRequest(dto as any, req as any);

      expect(service.createRequest).toHaveBeenCalled();
      expect(blockchainService.encodeWithdrawSalary).toHaveBeenCalledWith('QmCID');
      expect(result).toHaveProperty('cid', 'QmCID');
      expect(result).toHaveProperty('data', '0xhex');
    });

    it('should throw ForbiddenException if employee_id mismatch', async () => {
      const dto = { employee_id: 'e1', payroll_cycle_id: 'pc1', requested_amount: 1000 };
      const req = { user: { id: 'other' } };
      await expect(controller.createRequest(dto as any, req as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('simulate', () => {
    it('should throw ForbiddenException if employee_id mismatch', () => {
      const dto = { employee_id: 'e1', payroll_cycle_id: 'pcpc', requested_amount: 100 };
      const req = { user: { id: 'other' } };
      expect(() => controller.simulate(dto as any, req as any)).toThrow(ForbiddenException);
    });
  });
});
