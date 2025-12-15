import type { Schema } from '../../middlewares/validate';

export interface IncorporationIdParams {
  id: string;
}

export interface IncorporationsListQuery {
  contratId?: string;
}

export interface CreateIncorporationInput {
  contrat_id: string;
  date_effet: string; // YYYY-MM-DD
  date_expiration?: string | null; // YYYY-MM-DD
  nombre_elements: number;
  prime_ttc: number | string;
  fga: number | string;
  taxes: number | string;
  montant_accessoire?: number | string | null;
  prime_nette: number | string;
  commission: number | string;
  notes?: string | null;
  created_by?: string | null;
}

const ensureObject = (data: unknown): Record<string, unknown> => {
  if (data === null || typeof data !== 'object') {
    throw new Error('Payload invalide');
  }
  return data as Record<string, unknown>;
};

const ensureNonEmptyString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Le champ "${field}" est obligatoire`);
  }
  return value.trim();
};

const ensureDateString = (value: unknown, field: string): string => {
  const v = ensureNonEmptyString(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw new Error(`Le champ "${field}" doit être au format YYYY-MM-DD`);
  }
  return v;
};

const toNullableTrimmedString = (value: unknown): string | null | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toNumberLike = (value: unknown, field: string): number | string => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) throw new Error(`Le champ "${field}" est obligatoire`);
    return trimmed;
  }
  throw new Error(`Le champ "${field}" est obligatoire`);
};

const ensurePositiveInt = (value: unknown, field: string): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const n = Math.trunc(value);
    if (n <= 0) throw new Error(`Le champ "${field}" doit être > 0`);
    return n;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) throw new Error(`Le champ "${field}" est obligatoire`);
    const n = Number(trimmed);
    if (!Number.isFinite(n)) throw new Error(`Le champ "${field}" doit être un nombre`);
    const i = Math.trunc(n);
    if (i <= 0) throw new Error(`Le champ "${field}" doit être > 0`);
    return i;
  }
  throw new Error(`Le champ "${field}" est obligatoire`);
};

export const incorporationIdParamSchema: Schema<IncorporationIdParams> = {
  parse(data: unknown): IncorporationIdParams {
    const params = ensureObject(data);
    const id = params.id;
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Le paramètre "id" est obligatoire');
    }
    return { id: id.trim() };
  },
};

export const incorporationsListQuerySchema: Schema<IncorporationsListQuery> = {
  parse(data: unknown): IncorporationsListQuery {
    const query = ensureObject(data);
    const contratId =
      typeof query.contratId === 'string' ? query.contratId.trim() : undefined;
    return { contratId };
  },
};

export const createIncorporationSchema: Schema<CreateIncorporationInput> = {
  parse(data: unknown): CreateIncorporationInput {
    const body = ensureObject(data);

    const contrat_id = ensureNonEmptyString(body.contrat_id, 'contrat_id');
    const date_effet = ensureDateString(body.date_effet, 'date_effet');

    const date_expiration =
      typeof body.date_expiration === 'undefined'
        ? undefined
        : body.date_expiration === null
          ? null
          : ensureDateString(body.date_expiration, 'date_expiration');

    return {
      contrat_id,
      date_effet,
      date_expiration,
      nombre_elements: ensurePositiveInt(body.nombre_elements, 'nombre_elements'),
      prime_ttc: toNumberLike(body.prime_ttc, 'prime_ttc'),
      fga: toNumberLike(body.fga, 'fga'),
      taxes: toNumberLike(body.taxes, 'taxes'),
      montant_accessoire:
        typeof body.montant_accessoire === 'undefined'
          ? undefined
          : body.montant_accessoire === null
            ? null
            : toNumberLike(body.montant_accessoire, 'montant_accessoire'),
      prime_nette: toNumberLike(body.prime_nette, 'prime_nette'),
      commission: toNumberLike(body.commission, 'commission'),
      notes: toNullableTrimmedString(body.notes) ?? undefined,
      created_by: toNullableTrimmedString(body.created_by) ?? undefined,
    };
  },
};

