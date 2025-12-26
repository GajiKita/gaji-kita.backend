import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async getMyAccruedSalary(userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { user_id: userId, deleted: false },
      include: {
        company: {
          include: {
            payroll_cycles: {
              where: {
                period_start: { lte: new Date() },
                period_end: { gte: new Date() },
                deleted: false,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee record not found');
    }

    const currentCycle = employee.company.payroll_cycles[0];
    if (!currentCycle) {
      return {
        accruedAmount: 0,
        daysWorked: 0,
        message: 'No active payroll cycle found for today',
      };
    }

    const approvedLogsCount = await this.prisma.employeeWorkLog.count({
      where: {
        employee_id: employee.id,
        payroll_cycle_id: currentCycle.id,
        approved_by_id: { not: null },
        deleted: false,
      },
    });

    const salaryPerDay = employee.base_salary.toNumber() / currentCycle.total_working_days;
    const accruedAmount = salaryPerDay * approvedLogsCount;

    return {
      accruedAmount,
      daysWorked: approvedLogsCount,
      totalCycleDays: currentCycle.total_working_days,
      baseSalary: employee.base_salary.toNumber(),
      cyclePeriod: {
        start: currentCycle.period_start,
        end: currentCycle.period_end,
      },
    };
  }
}
