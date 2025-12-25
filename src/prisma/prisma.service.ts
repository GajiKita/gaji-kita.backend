import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ensureDatabaseUrl } from './prisma.utils';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = ensureDatabaseUrl();
    super({
      datasources: {
        db: {
          url,
        },
      },
    });
  }


  async onModuleInit() {
    await this.$connect();
  }


  async onModuleDestroy() {
    await this.$disconnect();
  }
}