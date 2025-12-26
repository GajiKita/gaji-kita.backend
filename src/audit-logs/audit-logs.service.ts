import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    action: string;
    entity: string;
    entity_id?: string;
    user_id?: string;
    details?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entity_id: data.entity_id,
        user_id: data.user_id,
        details: data.details,
      },
    });
  }

  async findAll(query: {
    userId?: string;
    entity?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        user_id: query.userId,
        entity: query.entity,
        action: query.action,
      },
      take: query.limit || 50,
      skip: query.offset || 0,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            wallet_address: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
