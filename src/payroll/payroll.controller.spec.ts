import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

describe('PayrollController', () => {
  let controller: PayrollController;
  let service: PayrollService;

  const mockPayrollService = {
    getMyAccruedSalary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [{ provide: PayrollService, useValue: mockPayrollService }],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service with req.user.id', async () => {
    const req = { user: { id: 'u1' } };
    await controller.getMyAccrued(req);
    expect(service.getMyAccruedSalary).toHaveBeenCalledWith('u1');
  });
});
