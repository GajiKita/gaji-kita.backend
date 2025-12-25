import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding companies...');

  const companies = [
    {
      name: 'Tech Innovators Inc.',
      address: 'Silicon Valley, CA',
      wallet_address: '0x1111111111111111111111111111111111111111',
      min_lock_percentage: 10,
    },
    {
      name: 'Global Solutions Ltd.',
      address: 'London, UK',
      wallet_address: '0x2222222222222222222222222222222222222222',
      min_lock_percentage: 15,
    },
    {
      name: 'Creative Agency Co.',
      address: 'New York, NY',
      wallet_address: '0x3333333333333333333333333333333333333333',
      min_lock_percentage: 5,
    },
  ];

  for (const company of companies) {
    const upsertedCompany = await prisma.company.upsert({
      where: { wallet_address: company.wallet_address },
      update: {},
      create: {
        name: company.name,
        address: company.address,
        wallet_address: company.wallet_address,
        min_lock_percentage: company.min_lock_percentage,
      },
    });
    console.log(`Created/Updated company: ${upsertedCompany.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
