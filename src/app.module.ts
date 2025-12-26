import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { EmployeesModule } from './employees/employees.module';
import { PayrollCyclesModule } from './payroll-cycles/payroll-cycles.module';
import { WorklogsModule } from './worklogs/worklogs.module';
import { WithdrawsModule } from './withdraws/withdraws.module';
import { FeesModule } from './fees/fees.module';
import { RepaymentsModule } from './repayments/repayments.module';
import { AuthModule } from './auth/auth.module';
import { InvestorsModule } from './investors/investors.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { SmartContractsModule } from './smart-contracts/smart-contracts.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { PayrollModule } from './payroll/payroll.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    CompaniesModule,
    EmployeesModule,
    PayrollCyclesModule,
    WorklogsModule,
    WithdrawsModule,
    FeesModule,
    RepaymentsModule,
    AuthModule,
    InvestorsModule,
    BlockchainModule,
    SmartContractsModule,
    AuditLogsModule,
    PayrollModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
