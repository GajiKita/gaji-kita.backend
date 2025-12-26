import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorklogDto } from './dto/create-worklog.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Address } from 'viem';

import { ROLES } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class WorklogsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private auditLogsService: AuditLogsService,
  ) {}

  create(createWorklogDto: CreateWorklogDto) {
    return this.prisma.employeeWorkLog.create({ data: createWorklogDto });
  }

  async checkIn(employeeId: string, payrollCycleId: string) {
    return this.prisma.employeeWorkLog.create({
      data: {
        employee_id: employeeId,
        payroll_cycle_id: payrollCycleId,
        date: new Date(),
        hours_worked: 0, // Initial state
      },
    });
  }

  async checkOut(worklogId: string, hours: number) {
    return this.prisma.employeeWorkLog.update({
      where: { id: worklogId },
      data: { hours_worked: hours },
    });
  }

  findAll(employeeId: string) {
    return this.prisma.employeeWorkLog.findMany({
      where: { employee_id: employeeId },
    });
  }

  async approve(worklogId: string, approverId: string) {
    const worklog = await this.prisma.employeeWorkLog.update({
      where: { id: worklogId },
      data: { approved_by_id: approverId },
      include: {
        employee: true,
        payroll_cycle: true,
      },
    });

    if (!worklog) {
      throw new NotFoundException('Worklog not found');
    }

    const { employee, payroll_cycle } = worklog;

    // Recalculate withdraw limit
    const daysWorked = await this.prisma.employeeWorkLog.count({
      where: {
        employee_id: employee.id,
        payroll_cycle_id: payroll_cycle.id,
        approved_by_id: { not: null },
      },
    });

    const salaryPerDay =
      employee.base_salary.toNumber() / payroll_cycle.total_working_days;
    const earnedAmount = salaryPerDay * daysWorked;
    const max30Percent = employee.base_salary.toNumber() * 0.3;

    const maxWithdrawAmount = Math.min(earnedAmount, max30Percent);

    const existingLimit = await this.prisma.withdrawLimit.findUnique({
      where: {
        employee_id_payroll_cycle_id: {
          employee_id: employee.id,
          payroll_cycle_id: payroll_cycle.id,
        },
      },
    });

    const usedAmount = existingLimit ? existingLimit.used_amount.toNumber() : 0;

    const withdrawLimit = await this.prisma.withdrawLimit.upsert({
      where: {
        employee_id_payroll_cycle_id: {
          employee_id: employee.id,
          payroll_cycle_id: payroll_cycle.id,
        },
      },
      update: {
        max_withdraw_amount: maxWithdrawAmount,
        remaining_amount: maxWithdrawAmount - usedAmount,
      },
      create: {
        employee_id: employee.id,
        payroll_cycle_id: payroll_cycle.id,
        max_withdraw_amount: maxWithdrawAmount,
        used_amount: 0,
        remaining_amount: maxWithdrawAmount,
        calculated_at: new Date(),
      },
    });

    // Prepare blockchain sync data
    const syncHex = this.blockchainService.encodeUpdateEmployeeDaysWorked(
      employee.wallet_address as Address,
      BigInt(daysWorked),
    );

    // 5. Audit Log
    await this.auditLogsService.log({
      action: 'APPROVE_WORKLOG',
      entity: 'EmployeeWorkLog',
      entity_id: worklogId,
      user_id: approverId,
      details: {
        employeeId: worklog.employee_id,
        payrollCycleId: worklog.payroll_cycle_id,
        hoursWorked: worklog.hours_worked.toNumber(),
        newDaysWorked: daysWorked,
      },
    });

    return {
      worklog,
      withdrawLimit,
      blockchainSync: {
        to: this.blockchainService.getContractAddress(),
        data: syncHex,
      },
    };
  }
}
