import { prisma } from '../../core/prisma';
import type { NotificationsListQuery, UpdateNotificationInput } from './notification.validation';

export class NotificationService {
  async getAll(filters: NotificationsListQuery) {
    const where: Record<string, any> = {};
    if (filters.statut) where.statut = filters.statut;

    return prisma.notifications.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: filters.limit ?? 50,
      include: {
        contrats: {
          include: {
            clients: true,
            compagnies: true,
          },
        },
      },
    });
  }

  async getById(id: string) {
    return prisma.notifications.findUnique({
      where: { id },
      include: {
        contrats: {
          include: {
            clients: true,
            compagnies: true,
          },
        },
      },
    });
  }

  async update(id: string, payload: UpdateNotificationInput) {
    const existing = await prisma.notifications.findUnique({ where: { id } });
    if (!existing) return null;

    const data: Record<string, unknown> = {};
    if ('statut' in payload) data.statut = payload.statut ?? null;

    return prisma.notifications.update({
      where: { id },
      data,
      include: {
        contrats: {
          include: {
            clients: true,
            compagnies: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    const existing = await prisma.notifications.findUnique({ where: { id } });
    if (!existing) return false;
    await prisma.notifications.delete({ where: { id } });
    return true;
  }
}

