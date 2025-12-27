import { Test, TestingModule } from '@nestjs/testing';
import { WorklogsController } from './worklogs.controller';
import { WorklogsService } from './worklogs.service';

describe('WorklogsController', () => {
  let controller: WorklogsController;
  let service: WorklogsService;

  const mockWorklogsService = {
    create: jest.fn(),
    checkIn: jest.fn(),
    checkOut: jest.fn(),
    findAll: jest.fn(),
    approve: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorklogsController],
      providers: [{ provide: WorklogsService, useValue: mockWorklogsService }],
    }).compile();

    controller = module.get<WorklogsController>(WorklogsController);
    service = module.get<WorklogsService>(WorklogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call checkIn', async () => {
    const req = { user: { id: 'e1' } };
    await controller.checkIn(req, 'pc1');
    expect(service.checkIn).toHaveBeenCalledWith('e1', 'pc1');
  });

  it('should call checkOut', async () => {
    await controller.checkOut('wl1', 8);
    expect(service.checkOut).toHaveBeenCalledWith('wl1', 8);
  });

  it('should call approve', async () => {
    const req = { user: { id: 'app1' } };
    await controller.approve('wl1', req);
    expect(service.approve).toHaveBeenCalledWith('wl1', 'app1');
  });
});
