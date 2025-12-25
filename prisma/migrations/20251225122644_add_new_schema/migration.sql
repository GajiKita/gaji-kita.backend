-- CreateEnum
CREATE TYPE "ROLES" AS ENUM ('ADMIN', 'HR', 'EMPLOYEE', 'INVESTOR');

-- CreateEnum
CREATE TYPE "WITHDRAW_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "FEE_MODE" AS ENUM ('PERCENTAGE', 'FIXED', 'MIXED');

-- CreateEnum
CREATE TYPE "FUND_SOURCE_TYPE" AS ENUM ('COMPANY_LOCK', 'INVESTOR_POOL', 'DEX_SWAP');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "ROLES" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "wallet_address" TEXT,
    "min_lock_percentage" DECIMAL(65,30) NOT NULL,
    "fee_share_company" DECIMAL(65,30) NOT NULL DEFAULT 2000,
    "fee_share_platform" DECIMAL(65,30) NOT NULL DEFAULT 8000,
    "fee_share_investor" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "reward_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "withdrawn_rewards" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "preferred_payout_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "deposited_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "reward_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "withdrawn_rewards" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "preferred_payout_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "investors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_number" TEXT,
    "position" TEXT,
    "base_salary" DECIMAL(65,30) NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "preferred_payout_token" TEXT,
    "status" TEXT,
    "sbt_token_id" TEXT,
    "employed_started" TIMESTAMP(3),
    "employed_ended" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_cycles" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "payout_date" DATE NOT NULL,
    "total_working_days" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payroll_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_work_logs" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payroll_cycle_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hours_worked" DECIMAL(65,30) NOT NULL,
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employee_work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_lock_pools" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "payroll_cycle_id" TEXT NOT NULL,
    "required_locked_amount" DECIMAL(65,30) NOT NULL,
    "actual_locked_amount" DECIMAL(65,30) NOT NULL,
    "available_amount" DECIMAL(65,30) NOT NULL,
    "locked_tx_hash" TEXT,
    "unlock_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "company_lock_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraw_fee_rules" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "fee_mode" "FEE_MODE" NOT NULL,
    "base_percentage" DECIMAL(65,30),
    "max_percentage" DECIMAL(65,30),
    "base_fixed_amount" DECIMAL(65,30),
    "early_access_penalty_perc_per_gap" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "withdraw_fee_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraw_limits" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payroll_cycle_id" TEXT NOT NULL,
    "max_withdraw_amount" DECIMAL(65,30) NOT NULL,
    "used_amount" DECIMAL(65,30) NOT NULL,
    "remaining_amount" DECIMAL(65,30) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "withdraw_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraw_requests" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payroll_cycle_id" TEXT NOT NULL,
    "requested_amount" DECIMAL(65,30) NOT NULL,
    "approved_amount" DECIMAL(65,30),
    "fee_total_amount" DECIMAL(65,30),
    "company_fee_amount" DECIMAL(65,30),
    "platform_fee_amount" DECIMAL(65,30),
    "investor_fee_amount" DECIMAL(65,30),
    "extra_liquidity_fee_amount" DECIMAL(65,30),
    "status" "WITHDRAW_STATUS" NOT NULL DEFAULT 'PENDING',
    "tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "withdraw_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraw_fund_sources" (
    "id" TEXT NOT NULL,
    "withdraw_request_id" TEXT NOT NULL,
    "source_type" "FUND_SOURCE_TYPE" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "investor_id" TEXT,
    "tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "withdraw_fund_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repay_records" (
    "id" TEXT NOT NULL,
    "withdraw_request_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payroll_cycle_id" TEXT NOT NULL,
    "repay_amount" DECIMAL(65,30) NOT NULL,
    "repay_source" TEXT,
    "tx_hash" TEXT,
    "repaid_at" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "repay_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_contracts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "abi" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "smart_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supported_tokens" (
    "address" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supported_tokens_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "companies_wallet_address_key" ON "companies"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "investors_wallet_address_key" ON "investors"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "employees_wallet_address_key" ON "employees"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "employees_sbt_token_id_key" ON "employees"("sbt_token_id");

-- CreateIndex
CREATE INDEX "employees_user_id_idx" ON "employees"("user_id");

-- CreateIndex
CREATE INDEX "employees_company_id_idx" ON "employees"("company_id");

-- CreateIndex
CREATE INDEX "payroll_cycles_company_id_idx" ON "payroll_cycles"("company_id");

-- CreateIndex
CREATE INDEX "employee_work_logs_employee_id_idx" ON "employee_work_logs"("employee_id");

-- CreateIndex
CREATE INDEX "employee_work_logs_payroll_cycle_id_idx" ON "employee_work_logs"("payroll_cycle_id");

-- CreateIndex
CREATE INDEX "employee_work_logs_approved_by_id_idx" ON "employee_work_logs"("approved_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_lock_pools_payroll_cycle_id_key" ON "company_lock_pools"("payroll_cycle_id");

-- CreateIndex
CREATE INDEX "company_lock_pools_company_id_idx" ON "company_lock_pools"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "withdraw_fee_rules_company_id_key" ON "withdraw_fee_rules"("company_id");

-- CreateIndex
CREATE INDEX "withdraw_limits_employee_id_idx" ON "withdraw_limits"("employee_id");

-- CreateIndex
CREATE INDEX "withdraw_limits_payroll_cycle_id_idx" ON "withdraw_limits"("payroll_cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "withdraw_limits_employee_id_payroll_cycle_id_key" ON "withdraw_limits"("employee_id", "payroll_cycle_id");

-- CreateIndex
CREATE INDEX "withdraw_requests_employee_id_idx" ON "withdraw_requests"("employee_id");

-- CreateIndex
CREATE INDEX "withdraw_requests_payroll_cycle_id_idx" ON "withdraw_requests"("payroll_cycle_id");

-- CreateIndex
CREATE INDEX "withdraw_fund_sources_withdraw_request_id_idx" ON "withdraw_fund_sources"("withdraw_request_id");

-- CreateIndex
CREATE INDEX "withdraw_fund_sources_investor_id_idx" ON "withdraw_fund_sources"("investor_id");

-- CreateIndex
CREATE UNIQUE INDEX "repay_records_withdraw_request_id_key" ON "repay_records"("withdraw_request_id");

-- CreateIndex
CREATE INDEX "repay_records_employee_id_idx" ON "repay_records"("employee_id");

-- CreateIndex
CREATE INDEX "repay_records_payroll_cycle_id_idx" ON "repay_records"("payroll_cycle_id");

-- AddForeignKey
ALTER TABLE "investors" ADD CONSTRAINT "investors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_cycles" ADD CONSTRAINT "payroll_cycles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_work_logs" ADD CONSTRAINT "employee_work_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_work_logs" ADD CONSTRAINT "employee_work_logs_payroll_cycle_id_fkey" FOREIGN KEY ("payroll_cycle_id") REFERENCES "payroll_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_work_logs" ADD CONSTRAINT "employee_work_logs_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_lock_pools" ADD CONSTRAINT "company_lock_pools_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_lock_pools" ADD CONSTRAINT "company_lock_pools_payroll_cycle_id_fkey" FOREIGN KEY ("payroll_cycle_id") REFERENCES "payroll_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_fee_rules" ADD CONSTRAINT "withdraw_fee_rules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_limits" ADD CONSTRAINT "withdraw_limits_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_limits" ADD CONSTRAINT "withdraw_limits_payroll_cycle_id_fkey" FOREIGN KEY ("payroll_cycle_id") REFERENCES "payroll_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_payroll_cycle_id_fkey" FOREIGN KEY ("payroll_cycle_id") REFERENCES "payroll_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_fund_sources" ADD CONSTRAINT "withdraw_fund_sources_withdraw_request_id_fkey" FOREIGN KEY ("withdraw_request_id") REFERENCES "withdraw_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_fund_sources" ADD CONSTRAINT "withdraw_fund_sources_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "investors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repay_records" ADD CONSTRAINT "repay_records_withdraw_request_id_fkey" FOREIGN KEY ("withdraw_request_id") REFERENCES "withdraw_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repay_records" ADD CONSTRAINT "repay_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repay_records" ADD CONSTRAINT "repay_records_payroll_cycle_id_fkey" FOREIGN KEY ("payroll_cycle_id") REFERENCES "payroll_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
