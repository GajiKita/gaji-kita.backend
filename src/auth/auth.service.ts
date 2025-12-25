import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { verifyMessage } from 'viem';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { walletAddress, signature, message } = signInDto;

    // 1. Verify the signature
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message: message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 2. Find or create the user (simple version: find first)
    let user = await this.prisma.user.findUnique({
      where: { wallet_address: walletAddress },
    });

    if (!user) {
      throw new UnauthorizedException('User not found. Please register first.');
    }

    // 3. Generate JWT
    const payload = {
      id: user.id,
      walletAddress: user.wallet_address,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        role: user.role,
      },
    };
  }
}
