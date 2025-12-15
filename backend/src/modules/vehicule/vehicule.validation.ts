import type { Schema } from '../../middlewares/validate';

export interface VehiculeIdParams {
  id: string;
}

export interface VehiculesListQuery {
  contratId?: string;
  active?: boolean;
}

export interface CreateVehiculeInput {
  contrat_id: string;
  immatriculation: string;
  marque?: string | null;
  modele?: string | null;
  annee?: number | null;
  valeur_venale?: number | string | null;
  puissance_fiscale?: number | null;
  numero_chassis?: string | null;
  date_mise_circulation?: string | null; // YYYY-MM-DD
  usage?: string | null;
  notes?: string | null;
}

export interface UpdateVehiculeInput extends Partial<Omit<CreateVehiculeInput, 'contrat_id'>> {
  contrat_id?: string;
  actif?: boolean;
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

const toNullableTrimmedString = (value: unknown): string | null | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toNullableInt = (value: unknown): number | null | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) throw new Error('Valeur numérique invalide');
    return Math.trunc(n);
  }
  return undefined;
};

const toNullableNumberLike = (value: unknown): number | string | null | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (value === null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    return trimmed;
  }
  return undefined;
};

const toNullableBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  return undefined;
};

const ensureDateString = (value: unknown, field: string): string => {
  const v = ensureNonEmptyString(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw new Error(`Le champ "${field}" doit être au format YYYY-MM-DD`);
  }
  return v;
};

export const vehiculeIdParamSchema: Schema<VehiculeIdParams> = {
  parse(data: unknown): VehiculeIdParams {
    const params = ensureObject(data);
    const id = params.id;
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Le paramètre "id" est obligatoire');
    }
    return { id: id.trim() };
  },
};

export const vehiculesListQuerySchema: Schema<VehiculesListQuery> = {
  parse(data: unknown): VehiculesListQuery {
    const query = ensureObject(data);
    const contratId =
      typeof query.contratId === 'string' ? query.contratId.trim() : undefined;
    const active = toNullableBoolean(query.active);
    return { contratId, active };
  },
};

export const createVehiculeSchema: Schema<CreateVehiculeInput> = {
  parse(data: unknown): CreateVehiculeInput {
    const body = ensureObject(data);

    const contrat_id = ensureNonEmptyString(body.contrat_id, 'contrat_id');
    const immatriculation = ensureNonEmptyString(body.immatriculation, 'immatriculation');

    return {
      contrat_id,
      immatriculation,
      marque: toNullableTrimmedString(body.marque) ?? undefined,
      modele: toNullableTrimmedString(body.modele) ?? undefined,
      annee: toNullableInt(body.annee) ?? undefined,
      valeur_venale: toNullableNumberLike(body.valeur_venale) ?? undefined,
      puissance_fiscale: toNullableInt(body.puissance_fiscale) ?? undefined,
      numero_chassis: toNullableTrimmedString(body.numero_chassis) ?? undefined,
      date_mise_circulation:
        typeof body.date_mise_circulation === 'undefined'
          ? undefined
          : body.date_mise_circulation === null
            ? null
            : ensureDateString(body.date_mise_circulation, 'date_mise_circulation'),
      usage: toNullableTrimmedString(body.usage) ?? undefined,
      notes: toNullableTrimmedString(body.notes) ?? undefined,
    };
  },
};

export const updateVehiculeSchema: Schema<UpdateVehiculeInput> = {
  parse(data: unknown): UpdateVehiculeInput {
    const body = ensureObject(data);
    const result: UpdateVehiculeInput = {};

    if ('contrat_id' in body) {
      if (typeof (body as any).contrat_id !== 'string') {
        throw new Error('Le champ "contrat_id" doit être une chaîne');
      }
      result.contrat_id = (body as any).contrat_id.trim();
    }

    if ('immatriculation' in body) {
      const v = toNullableTrimmedString((body as any).immatriculation);
      if (typeof v !== 'undefined') {
        if (v === null) throw new Error('Le champ "immatriculation" ne peut pas être null');
        result.immatriculation = v;
      }
    }

    if ('marque' in body) {
      const v = toNullableTrimmedString((body as any).marque);
      if (typeof v !== 'undefined') result.marque = v;
    }

    if ('modele' in body) {
      const v = toNullableTrimmedString((body as any).modele);
      if (typeof v !== 'undefined') result.modele = v;
    }

    if ('annee' in body) {
      const v = toNullableInt((body as any).annee);
      if (typeof v !== 'undefined') result.annee = v;
    }

    if ('valeur_venale' in body) {
      const v = toNullableNumberLike((body as any).valeur_venale);
      if (typeof v !== 'undefined') result.valeur_venale = v;
    }

    if ('puissance_fiscale' in body) {
      const v = toNullableInt((body as any).puissance_fiscale);
      if (typeof v !== 'undefined') result.puissance_fiscale = v;
    }

    if ('numero_chassis' in body) {
      const v = toNullableTrimmedString((body as any).numero_chassis);
      if (typeof v !== 'undefined') result.numero_chassis = v;
    }

    if ('date_mise_circulation' in body) {
      if ((body as any).date_mise_circulation === null) {
        result.date_mise_circulation = null;
      } else {
        result.date_mise_circulation = ensureDateString(
          (body as any).date_mise_circulation,
          'date_mise_circulation',
        );
      }
    }

    if ('usage' in body) {
      const v = toNullableTrimmedString((body as any).usage);
      if (typeof v !== 'undefined') result.usage = v;
    }

    if ('notes' in body) {
      const v = toNullableTrimmedString((body as any).notes);
      if (typeof v !== 'undefined') result.notes = v;
    }

    if ('actif' in body) {
      if (typeof (body as any).actif !== 'boolean') {
        throw new Error('Le champ "actif" doit être un booléen');
      }
      result.actif = (body as any).actif;
    }

    return result;
  },
};

