import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ROLES } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should call authService.signIn', async () => {
      const dto = { walletAddress: '0x123', signature: '0xsig', message: 'msg' };
      await controller.signIn(dto);
      expect(service.signIn).toHaveBeenCalledWith(dto);
    });
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = {
        walletAddress: '0x123',
        signature: '0xsig',
        message: 'msg',
        email: 't@t.com',
        role: ROLES.EMPLOYEE,
      };
      await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });
});
