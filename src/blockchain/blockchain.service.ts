import { Injectable, OnModuleInit } from '@nestjs/common';
import { createPublicClient, http, Address, parseAbi, encodeFunctionData } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private publicClient;
  private readonly contractAddress: Address = (process.env.CONTRACT_ADDRESS as Address) || '0x0000000000000000000000000000000000000000';

  private readonly abi = parseAbi([
    'function getEmployeeInfo(address _employeeId) external view returns (bool exists, address companyId, string memory name, uint256 monthlySalary, uint256 daysWorked, uint256 withdrawnAmount)',
    'function updateEmployeeDaysWorked(address _employeeId, uint256 _days) external',
    'function withdrawSalary(string memory _cid) external',
    'function withdrawCompanyReward(uint256 _amount, string memory _cid) external',
    'function withdrawInvestorReward(uint256 _amount, string memory _cid) external',
    'function lockCompanyLiquidityToken(uint256 amount, string calldata cid) external',
    'function depositInvestorLiquidityToken(uint256 amount, string calldata cid) external',
    'function withdrawPlatformFee(uint256 _amount, string memory _cid) external',
    'function setPreferredPayoutToken(address token) external',
    'function setCompanyPayoutToken(address _companyId, address token) external',
    'function setInvestorPayoutToken(address token) external',
    'function getSupportedPayoutTokens() external view returns (address[] memory)',
  ]);

  private readonly erc20Abi = parseAbi([
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)',
  ]);

  constructor(private readonly prisma: PrismaService) {
    this.publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(process.env.RPC_URL),
    });
  }

  async onModuleInit() {
    this.listenToEvents();
    try {
      await this.syncSupportedTokens();
    } catch (error) {
      console.error('Failed to sync supported tokens on init:', error);
    }
  }

  private listenToEvents() {
    console.log('Listening to GajiKita events...');
    // TODO: Implement event listeners for synchronization
  }

  async getEmployeeInfo(employeeAddress: Address) {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: this.abi,
      functionName: 'getEmployeeInfo',
      args: [employeeAddress],
    });
  }

  async getSupportedPayoutTokens() {
    return this.prisma.supportedToken.findMany({
      where: { is_active: true },
    });
  }

  async syncSupportedTokens() {
    console.log('Syncing supported tokens from blockchain...');
    const tokenAddresses = (await this.publicClient.readContract({
      address: this.contractAddress,
      abi: this.abi,
      functionName: 'getSupportedPayoutTokens',
    })) as Address[];

    for (const address of tokenAddresses) {
      try {
        const [name, symbol, decimals] = await Promise.all([
          this.publicClient.readContract({
            address,
            abi: this.erc20Abi,
            functionName: 'name',
          }),
          this.publicClient.readContract({
            address,
            abi: this.erc20Abi,
            functionName: 'symbol',
          }),
          this.publicClient.readContract({
            address,
            abi: this.erc20Abi,
            functionName: 'decimals',
          }),
        ]);

        await this.prisma.supportedToken.upsert({
          where: { address },
          update: {
            name: name as string,
            symbol: symbol as string,
            decimals: Number(decimals),
            is_active: true,
          },
          create: {
            address,
            name: name as string,
            symbol: symbol as string,
            decimals: Number(decimals),
            is_active: true,
          },
        });
      } catch (error) {
        console.error(`Failed to sync token ${address}:`, error);
      }
    }

    // Optionally: marking tokens not in the list as inactive
    const existingTokens = await this.prisma.supportedToken.findMany();
    for (const token of existingTokens) {
      if (!tokenAddresses.includes(token.address as Address)) {
        await this.prisma.supportedToken.update({
          where: { address: token.address },
          data: { is_active: false },
        });
      }
    }

    return { syncedCount: tokenAddresses.length };
  }

  encodeWithdrawSalary(cid: string) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'withdrawSalary',
      args: [cid],
    });
  }

  encodeWithdrawCompanyReward(amount: bigint, cid: string) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'withdrawCompanyReward',
      args: [amount, cid],
    });
  }

  encodeWithdrawInvestorReward(amount: bigint, cid: string) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'withdrawInvestorReward',
      args: [amount, cid],
    });
  }

  encodeLockCompanyLiquidity(amount: bigint, cid: string) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'lockCompanyLiquidityToken',
      args: [amount, cid],
    });
  }

  encodeDepositInvestorLiquidity(amount: bigint, cid: string) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'depositInvestorLiquidityToken',
      args: [amount, cid],
    });
  }

  encodeWithdrawPlatformFee(amount: bigint, cid: string) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'withdrawPlatformFee',
      args: [amount, cid],
    });
  }

  encodeSetPreferredPayoutToken(token: Address) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'setPreferredPayoutToken',
      args: [token],
    });
  }

  encodeSetCompanyPayoutToken(companyId: Address, token: Address) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'setCompanyPayoutToken',
      args: [companyId, token],
    });
  }

  encodeSetInvestorPayoutToken(token: Address) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'setInvestorPayoutToken',
      args: [token],
    });
  }

  encodeUpdateEmployeeDaysWorked(employeeId: Address, days: bigint) {
    return encodeFunctionData({
      abi: this.abi,
      functionName: 'updateEmployeeDaysWorked',
      args: [employeeId, days],
    });
  }

  getContractAddress(): string {
    return this.contractAddress;
  }
}
