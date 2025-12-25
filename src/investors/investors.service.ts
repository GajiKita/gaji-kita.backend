import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestorDto } from './dto/create-investor.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';

@Injectable()
export class InvestorsService {
  constructor(private prisma: PrismaService) {}

  create(createInvestorDto: CreateInvestorDto) {
    return this.prisma.investor.create({
      data: createInvestorDto,
    });
  }

  findAll() {
    return this.prisma.investor.findMany({
      where: { deleted: false },
      include: { user: true },
    });
  }

  async findOne(id: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!investor) throw new NotFoundException('Investor not found');
    return investor;
  }

  update(id: string, updateInvestorDto: UpdateInvestorDto) {
    return this.prisma.investor.update({
      where: { id },
      data: updateInvestorDto,
    });
  }

  remove(id: string) {
    return this.prisma.investor.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async getInvestorByWallet(walletAddress: string) {
    return this.prisma.investor.findUnique({
      where: { wallet_address: walletAddress },
    });
  }

  updatePreferredToken(id: string, tokenAddress: string) {
    return this.prisma.investor.update({
      where: { id },
      data: { preferred_payout_token: tokenAddress },
    });
  }
}
