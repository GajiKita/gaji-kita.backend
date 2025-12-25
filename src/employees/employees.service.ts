import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: createEmployeeDto });
  }

  findAll(companyId: string) {
    return this.prisma.employee.findMany({
      where: { company_id: companyId, deleted: false },
    });
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  remove(id: string) {
    return this.prisma.employee.update({
      where: { id },
      data: { deleted: true },
    });
  }

  updatePreferredToken(id: string, tokenAddress: string) {
    return this.prisma.employee.update({
      where: { id },
      data: { preferred_payout_token: tokenAddress },
    });
  }
}
