import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getAdminStats: jest.fn(),
    getHRStats: jest.fn(),
    getInvestorStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockAnalyticsService }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAdminStats', async () => {
    await controller.getAdminStats();
    expect(service.getAdminStats).toHaveBeenCalled();
  });

  it('should call getHRStats', async () => {
    await controller.getHRStats({ user: { id: 'hr1' } });
    expect(service.getHRStats).toHaveBeenCalledWith('hr1');
  });

  it('should call getInvestorStats', async () => {
    await controller.getInvestorStats({ user: { id: 'inv1' } });
    expect(service.getInvestorStats).toHaveBeenCalledWith('inv1');
  });
});
