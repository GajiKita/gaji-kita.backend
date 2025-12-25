import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({ data: createCompanyDto });
  }

  findAll() {
    return this.prisma.company.findMany({ where: { deleted: false } });
  }

  findOne(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  remove(id: string) {
    return this.prisma.company.update({
      where: { id },
      data: { deleted: true },
    });
  }

  updatePreferredToken(id: string, tokenAddress: string) {
    return this.prisma.company.update({
      where: { id },
      data: { preferred_payout_token: tokenAddress },
    });
  }
}
