import type { Schema } from '../../middlewares/validate';

export interface NotificationIdParams {
  id: string;
}

export interface NotificationsListQuery {
  limit?: number;
  statut?: string;
}

export interface UpdateNotificationInput {
  statut?: string | null;
}

const ensureObject = (data: unknown): Record<string, unknown> => {
  if (data === null || typeof data !== 'object') {
    throw new Error('Payload invalide');
  }
  return data as Record<string, unknown>;
};

const toOptionalInt = (value: unknown): number | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return undefined;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) throw new Error('Le paramètre "limit" doit être un nombre');
    return Math.trunc(n);
  }
  return undefined;
};

const toNullableTrimmedString = (value: unknown): string | null | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const notificationIdParamSchema: Schema<NotificationIdParams> = {
  parse(data: unknown): NotificationIdParams {
    const params = ensureObject(data);
    const id = params.id;
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Le paramètre "id" est obligatoire');
    }
    return { id: id.trim() };
  },
};

export const notificationsListQuerySchema: Schema<NotificationsListQuery> = {
  parse(data: unknown): NotificationsListQuery {
    const query = ensureObject(data);
    const limit = toOptionalInt(query.limit);
    const statut = typeof query.statut === 'string' ? query.statut.trim() : undefined;

    const normalizedLimit = typeof limit === 'number' ? Math.min(Math.max(limit, 1), 200) : undefined;
    return { limit: normalizedLimit, statut };
  },
};

export const updateNotificationSchema: Schema<UpdateNotificationInput> = {
  parse(data: unknown): UpdateNotificationInput {
    const body = ensureObject(data);
    const result: UpdateNotificationInput = {};

    if ('statut' in body) {
      const v = toNullableTrimmedString((body as any).statut);
      if (typeof v !== 'undefined') result.statut = v;
    }

    return result;
  },
};

