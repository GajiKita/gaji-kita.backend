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

  private readonly MONTHS_ID: { [key: string]: number } = {
    Januari: 0,
    Februari: 1,
    Maret: 2,
    April: 3,
    Mei: 4,
    Juni: 5,
    Juli: 6,
    Agustus: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Desember: 11,
  };

  private validateAndParseMessage(message: string): Date {
    const regex = /^I am doing the signature on (?:[a-zA-Z]+),\s+(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})\s+(\d{2}):(\d{2})$/;
    const match = message.match(regex);

    if (!match) {
      throw new UnauthorizedException('Invalid message format');
    }

    const [, day, monthStr, year, hour, minute] = match;
    const month = this.MONTHS_ID[monthStr];

    if (month === undefined) {
      throw new UnauthorizedException('Invalid month in message');
    }

    const messageDate = new Date(
      parseInt(year),
      month,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
    );

    const now = new Date();
    const diff = Math.abs(now.getTime() - messageDate.getTime());

    // 2 minutes tolerance (120,000ms)
    if (diff > 120000) {
      throw new UnauthorizedException('Signature expired or timestamp invalid');
    }

    return messageDate;
  }

  async signIn(signInDto: SignInDto) {
    const { walletAddress, signature, message } = signInDto;

    // 1. Validate the message format and timestamp
    this.validateAndParseMessage(message);

    // 2. Verify the signature
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message: message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 3. Find or create the user (simple version: find first)
    const user = await this.prisma.user.findUnique({
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
