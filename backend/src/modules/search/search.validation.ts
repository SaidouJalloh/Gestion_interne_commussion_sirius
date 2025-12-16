import type { Schema } from '../../middlewares/validate';

export interface SearchQuery {
  q: string;
  limit?: number;
}

const ensureObject = (data: unknown): Record<string, unknown> => {
  if (data === null || typeof data !== 'object') {
    throw new Error('Payload invalide');
  }
  return data as Record<string, unknown>;
};

const ensureNonEmptyString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Le paramètre "${field}" est obligatoire`);
  }
  return value.trim();
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

export const searchQuerySchema: Schema<SearchQuery> = {
  parse(data: unknown): SearchQuery {
    const query = ensureObject(data);
    const q = ensureNonEmptyString(query.q, 'q');
    const limit = toOptionalInt(query.limit);
    const normalizedLimit = typeof limit === 'number' ? Math.min(Math.max(limit, 1), 20) : undefined;
    return { q, limit: normalizedLimit };
  },
};

