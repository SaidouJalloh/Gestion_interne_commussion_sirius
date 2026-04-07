import type { Schema } from '../../middlewares/validate';
import type { SimulationParams, ReferentielType } from './provider.interface';

// ─── Simulate ─────────────────────────────────────────────────────────

export interface SimulateInput {
  compagnie_id: string;
  type: SimulationParams['type'];
  params: Record<string, unknown>;
}

const VALID_SIMULATION_TYPES = [
  'AUTOMOBILE',
  'AUTOMOBILE_PACK',
  'VOYAGE',
  'MRH',
  'RAPATRIEMENT',
] as const;

const ensureObject = (data: unknown): Record<string, unknown> => {
  if (data === null || typeof data !== 'object') {
    throw new Error('Payload invalide');
  }
  return data as Record<string, unknown>;
};

export const simulateSchema: Schema<SimulateInput> = {
  parse(data: unknown): SimulateInput {
    const body = ensureObject(data);

    if (typeof body.compagnie_id !== 'string' || !body.compagnie_id.trim()) {
      throw new Error('Le champ "compagnie_id" est obligatoire');
    }

    if (
      typeof body.type !== 'string' ||
      !VALID_SIMULATION_TYPES.includes(body.type as any)
    ) {
      throw new Error(
        `Le champ "type" doit être l'un de: ${VALID_SIMULATION_TYPES.join(', ')}`,
      );
    }

    if (!body.params || typeof body.params !== 'object') {
      throw new Error('Le champ "params" est obligatoire et doit être un objet');
    }

    return {
      compagnie_id: body.compagnie_id.trim(),
      type: body.type as SimulationParams['type'],
      params: body.params as Record<string, unknown>,
    };
  },
};

// ─── Referentiel ──────────────────────────────────────────────────────

export interface ReferentielQuery {
  type: ReferentielType;
  [key: string]: string | undefined;
}

const VALID_REFERENTIEL_TYPES = [
  'packs',
  'branches',
  'categories',
  'sous_categories',
  'marques',
  'pays',
  'type_piece',
  'carrosseries',
] as const;

export const referentielQuerySchema: Schema<ReferentielQuery> = {
  parse(data: unknown): ReferentielQuery {
    const query = ensureObject(data);

    if (
      typeof query.type !== 'string' ||
      !VALID_REFERENTIEL_TYPES.includes(query.type as any)
    ) {
      throw new Error(
        `Le paramètre "type" doit être l'un de: ${VALID_REFERENTIEL_TYPES.join(', ')}`,
      );
    }

    return query as unknown as ReferentielQuery;
  },
};

// ─── CompagnieId param ────────────────────────────────────────────────

export interface CompagnieIdParam {
  compagnieId: string;
}

export const compagnieIdParamSchema: Schema<CompagnieIdParam> = {
  parse(data: unknown): CompagnieIdParam {
    const params = ensureObject(data);

    if (typeof params.compagnieId !== 'string' || !params.compagnieId.trim()) {
      throw new Error('Le paramètre "compagnieId" est obligatoire');
    }

    return { compagnieId: params.compagnieId.trim() };
  },
};
