import { prisma } from '../../core/prisma';
import type { NotificationsListQuery, UpdateNotificationInput } from './notification.validation';

export class NotificationService {
  async getAll(filters: NotificationsListQuery, organizationId: string) {
    const where: Record<string, any> = {
      organization_id: organizationId,
    };
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

  async getById(id: string, organizationId: string) {
    return prisma.notifications.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
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

  async update(id: string, payload: UpdateNotificationInput, organizationId: string) {
    const existing = await prisma.notifications.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
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

  async delete(id: string, organizationId: string) {
    const existing = await prisma.notifications.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
    if (!existing) return false;
    await prisma.notifications.delete({ where: { id } });
    return true;
  }
}

