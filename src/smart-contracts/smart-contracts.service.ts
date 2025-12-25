import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmartContractDto } from './dto/create-smart-contract.dto';
import { UpdateSmartContractDto } from './dto/update-smart-contract.dto';

@Injectable()
export class SmartContractsService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateSmartContractDto) {
    return this.prisma.smartContract.create({
      data: createDto,
    });
  }

  findAll() {
    return this.prisma.smartContract.findMany({
      where: { deleted: false },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.smartContract.findUnique({
      where: { id, deleted: false },
    });
    if (!record) throw new NotFoundException(`Smart contract with ID ${id} not found`);
    return record;
  }

  update(id: string, updateDto: UpdateSmartContractDto) {
    return this.prisma.smartContract.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    return this.prisma.smartContract.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
