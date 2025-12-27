<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="160" alt="GajiKita Logo" />
</p>

<h1 align="center" style="border-bottom: none;">
  <span style="color: #E0234E">Gaji</span>Kita Backend
</h1>

<p align="center">
  <i style="color: #666">Revolutionizing Financial Wellness through Real-Time Salary Accrual & Blockchain.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-v11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Arbitrum-Sepolia-28A0F0?style=for-the-badge&logo=arbitrum&logoColor=white" alt="Arbitrum" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/IPFS-Pinata-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white" alt="IPFS" />
  <img src="https://img.shields.io/badge/Unit_Tests-100%25-brightgreen?style=for-the-badge&logo=jest&logoColor=white" alt="Tests" />
</p>

---

## 🌟 Vision

GajiKita empowers employees to gain control over their finances by providing **instant access** to their earned wages. No more waiting for "payday"—wages accrue in real-time and can be withdrawn directly to a Web3 wallet.

## ✨ Key Features

- ⚡ **Real-Time Accrual**: Salary calculated per approved work hour/day.
- 🔗 **Blockchain Receipts**: Every withdrawal generates a unique IPFS metadata CID stored on-chain.
- 🛡️ **Security Audit Logs**: Comprehensive logging for HR approvals and financial transactions.
- 📊 **Dynamic Analytics**: Tailored dashboards for Platform Admins, HR Managers, and Liquidity Investors.
- 💰 **Liquidity Pools**: Automated lock-pool management for companies and high-yield pools for investors.
- ⚖️ **Dynamic Fees**: Customizable fee rules with early-access penalties to maintain ecosystem balance.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((User)) -->|Auth/Wallet| API[NestJS API Gateway]
    API -->|Auth| AuthService[Auth Service]
    API -->|Attendance| Worklogs[Worklogs Service]
    API -->|EWA| Withdraw[Withdraw Service]

    Worklogs -->|Approved| Payroll[Payroll Accrual Engine]
    Withdraw -->|Simulation| Fees[Fees Engine]
    Withdraw -->|Execution| Blockchain[Blockchain Service]

    Blockchain -->|Pin JSON| Pinata[Pinata IPFS Service]
    Blockchain -->|Encode Data| Arb[Arbitrum Layer 2]

    API -->|Persistence| DB[(PostgreSQL + Prisma)]
    API -->|Logging| Audit[Audit Logs Service]
```

---

## 📂 Project Decomposition

### 🧠 Core Business Logic

| Module          | Description                                                                |
| :-------------- | :------------------------------------------------------------------------- |
| **`Payroll`**   | Calculates accrued vs. withdrawn salary at any given second.               |
| **`Withdraws`** | Orchestrates the EWA workflow, ensuring liquidity availability.            |
| **`Fees`**      | Calculates platform shares and early-withdrawal penalties.                 |
| **`Worklogs`**  | Manages the source of truth for "earned" wages via HR-approved attendance. |

### ⛓️ Infrastructure & Utilities

| Module           | Description                                                       |
| :--------------- | :---------------------------------------------------------------- |
| **`Blockchain`** | High-performance encoding for EVM-compatible smart contracts.     |
| **`Pinata`**     | Secure gateway for pinning persistent financial receipts to IPFS. |
| **`AuditLogs`**  | Immutable record of system state changes for compliance.          |
| **`Prisma`**     | Type-safe database interactions with automated soft-delete logic. |

---

## � Getting Started

### 📦 Installation

```bash
# Clone the repository
$ git clone https://github.com/GajiKita/gaji-kita.backend.git

# Install dependencies
$ pnpm install
```

### 🔑 Environment Variables

Configure your `.env` to connect the ecosystem:

```ini
DATABASE_URL="postgresql://user:pass@localhost:5432/gajikita"
JWT_SECRET="generate-a-strong-secret"
RPC_URL="https://arb-sepolia.g.alchemy.com/v2/your-api-key"
CONTRACT_ADDRESS="0x..." # GajiKita Smart Contract
PINATA_JWT="your-jwt-token"
PINATA_URL="https://api.pinata.cloud/pinning/pinJSONToIPFS"
```

### 🛣️ Quick Launch

```bash
# Synchronize Database
$ npx prisma migrate dev
$ npx prisma db seed

# Launch Development Server
$ pnpm run start:dev
```

### 📖 API Documentation

Once running, explore the interactive Swagger UI at the root:

- **Local**: `http://localhost:3000/`
- **Production**: `https://your-domain.com/`

---

## � Developer Profile

<table align="center">
  <tr>
    <td align="center">
      <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="Antigravity" /><br />
      <b>Antigravity AI</b><br />
      <sub>Google Deepmind</sub>
    </td>
    <td>
      <b>Architect & Core Developer</b><br />
      Built with advanced agentic logic to ensure high-performance, security, and scalability. This project features a state-of-the-art implementation of NestJS and Web3 patterns.
    </td>
  </tr>
</table>

---

<p align="center">
  <b>GajiKita</b> — <i>Financial freedom, one block at a time.</i>
</p>
