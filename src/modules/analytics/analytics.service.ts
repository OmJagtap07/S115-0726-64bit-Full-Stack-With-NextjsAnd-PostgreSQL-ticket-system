import { prisma } from '../../core/database/prisma';
import { OverviewDTO, TrendDataPoint, WorkloadDataPoint, DistributionDataPoint } from './analytics.dto';

export class AnalyticsService {
  static async getOverview(): Promise<OverviewDTO> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      total,
      open,
      inProgress,
      unassigned,
      closed,
      createdToday,
      closedToday
    ] = await Promise.all([
      prisma.ticket.count({ where: { deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'OPEN', deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'IN_PROGRESS', deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'UNASSIGNED', deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'CLOSED', deletedAt: null } }),
      prisma.ticket.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
      prisma.ticket.count({ where: { closedAt: { gte: today }, deletedAt: null } }),
    ]);

    // Average Resolution Time
    // Calculate AVG(closedAt - createdAt) in milliseconds
    const rawResult = await prisma.$queryRaw<[{ avg_ms: number | null }]>`
      SELECT AVG(EXTRACT(EPOCH FROM ("closedAt" - "createdAt")) * 1000) as avg_ms
      FROM "Ticket"
      WHERE "closedAt" IS NOT NULL AND "deletedAt" IS NULL
    `;
    
    const averageResolutionTimeMs = rawResult[0]?.avg_ms ? Number(rawResult[0].avg_ms) : 0;

    return {
      total,
      open,
      inProgress,
      unassigned,
      closed,
      createdToday,
      closedToday,
      averageResolutionTimeMs
    };
  }

  static async getTrends(): Promise<TrendDataPoint[]> {
    // Group by date string (YYYY-MM-DD)
    // Prisma does not have native date_trunc in groupBy for Postgres out of the box,
    // so we'll use a fast raw query for the trend.
    const rawResult = await prisma.$queryRaw<[{ date: string, count: number }]>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM "Ticket"
      WHERE "deletedAt" IS NULL
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date ASC
      LIMIT 30
    `;
    
    return rawResult.map(r => ({
      date: r.date,
      count: Number(r.count)
    }));
  }

  static async getWorkload(): Promise<WorkloadDataPoint[]> {
    const grouped = await prisma.ticket.groupBy({
      by: ['assigneeId'],
      _count: { id: true },
      where: { assigneeId: { not: null }, deletedAt: null }
    });

    // Fetch user names
    const userIds = grouped.map(g => g.assigneeId as string);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true }
    });
    const userMap = new Map(users.map(u => [u.id, u.name]));

    return grouped.map(g => ({
      agentName: userMap.get(g.assigneeId as string) || 'Unknown Agent',
      count: g._count.id
    })).sort((a, b) => b.count - a.count);
  }

  static async getStatusDistribution(): Promise<DistributionDataPoint[]> {
    const grouped = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { deletedAt: null }
    });

    return grouped.map(g => ({
      name: g.status,
      count: g._count.id
    }));
  }

  static async getPriorityDistribution(): Promise<DistributionDataPoint[]> {
    const grouped = await prisma.ticket.groupBy({
      by: ['priority'],
      _count: { id: true },
      where: { deletedAt: null }
    });

    return grouped.map(g => ({
      name: g.priority,
      count: g._count.id
    }));
  }
}
