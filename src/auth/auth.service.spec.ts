import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { verifyMessage } from 'viem';
import { ROLES } from '@prisma/client';

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
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
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
      signature: '0xsig',
      message: 'I am doing the signature on Senin, 1 Januari 2024 12:00',
    };

    it('should sign in successfully', async () => {
      (verifyMessage as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        wallet_address: '0x123',
        role: ROLES.EMPLOYEE,
      });

      const result = await service.signIn(signInDto);

      expect(result).toHaveProperty('access_token');
      expect(result.user.walletAddress).toBe('0x123');
    });

    it('should throw UnauthorizedException for invalid message format', async () => {
      await expect(service.signIn({ ...signInDto, message: 'invalid' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid signature', async () => {
      (verifyMessage as jest.Mock).mockResolvedValue(false);
      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (verifyMessage as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      walletAddress: '0x123',
      signature: '0xsig',
      message: 'I register as EMPLOYEE on Senin, 1 Januari 2024 12:00',
      email: 'test@example.com',
      role: ROLES.EMPLOYEE,
    };

    it('should register successfully', async () => {
      (verifyMessage as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-id',
        wallet_address: '0x123',
        role: ROLES.EMPLOYEE,
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result.user.id).toBe('new-user-id');
    });

    it('should throw ConflictException if user already exists', async () => {
      (verifyMessage as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });
});
