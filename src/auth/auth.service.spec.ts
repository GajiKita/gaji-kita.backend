import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as viem from 'viem';

jest.mock('viem', () => ({
  verifyMessage: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const signInDto = {
      walletAddress: '0x123',
      signature: '0xabc',
      message: 'Sign me',
    };

    it('should throw UnauthorizedException if signature is invalid', async () => {
      (viem.verifyMessage as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (viem.verifyMessage as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token if credentials are valid', async () => {
      const user = { id: '1', wallet_address: '0x123', role: 'EMPLOYEE' };
      (viem.verifyMessage as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('validToken');

      const result = await service.signIn(signInDto);

      expect(result).toEqual({
        access_token: 'validToken',
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          role: user.role,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: user.id,
        walletAddress: user.wallet_address,
        role: user.role,
      });
    });
  });
});
