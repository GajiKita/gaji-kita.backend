import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ForbiddenException } from '@nestjs/common';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockEmployeesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCompanyId: jest.fn(),
    findCompanyByUserId: jest.fn(),
  };

  const mockBlockchainService = {
    encodeSetPreferredPayoutToken: jest.fn(),
    getContractAddress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: mockEmployeesService },
        { provide: BlockchainService, useValue: mockBlockchainService },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all employees', async () => {
      await controller.findAll('c1');
      expect(service.findAll).toHaveBeenCalledWith('c1');
    });
  });

  describe('findMyCompanyEmployees', () => {
    it('should return employees for the HR company', async () => {
      const req = { user: { id: 'hr1' } };
      mockEmployeesService.findCompanyByUserId.mockResolvedValue('c1');
      await controller.findMyCompanyEmployees(req);
      expect(service.findByCompanyId).toHaveBeenCalledWith('c1');
    });

    it('should throw ForbiddenException if HR has no company', async () => {
      const req = { user: { id: 'hr1' } };
      mockEmployeesService.findCompanyByUserId.mockResolvedValue(null);
      await expect(controller.findMyCompanyEmployees(req)).rejects.toThrow(ForbiddenException);
    });
  });
});
