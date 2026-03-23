export interface CreateSinistreInput {
  contrat_id: string;
  type_sinistre: string;
  date_sinistre: string;
  heure_sinistre?: string;
  lieu_sinistre: string;
  description: string;
  circonstances?: string;
  dommages_corporels?: boolean;
  nombre_blesses?: number;
  dommages_materiels?: boolean;
  montant_estime?: number;
  vehicule_id?: string;
  vehicule_roulant?: boolean;
  tiers_impliques?: unknown[];
}

export interface CreateDevisInput {
  type_assurance: string;
  details: Record<string, unknown>;
}

export interface SendMessageInput {
  message: string;
}

export interface IdParam {
  id: string;
}

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

const isValidUuid = (v: unknown): boolean =>
  typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export const createSinistreSchema = {
  parse(body: unknown): CreateSinistreInput {
    const b = body as Record<string, unknown>;
    if (!isValidUuid(b.contrat_id)) throw new Error('contrat_id est requis (UUID)');
    if (!isNonEmptyString(b.type_sinistre)) throw new Error('type_sinistre est requis');
    if (!isNonEmptyString(b.date_sinistre)) throw new Error('date_sinistre est requis');
    if (!isNonEmptyString(b.lieu_sinistre)) throw new Error('lieu_sinistre est requis');
    if (!isNonEmptyString(b.description)) throw new Error('description est requise');

    return {
      contrat_id: (b.contrat_id as string).trim(),
      type_sinistre: (b.type_sinistre as string).trim(),
      date_sinistre: (b.date_sinistre as string).trim(),
      heure_sinistre: typeof b.heure_sinistre === 'string' ? b.heure_sinistre.trim() : undefined,
      lieu_sinistre: (b.lieu_sinistre as string).trim(),
      description: (b.description as string).trim(),
      circonstances: typeof b.circonstances === 'string' ? b.circonstances.trim() : undefined,
      dommages_corporels: typeof b.dommages_corporels === 'boolean' ? b.dommages_corporels : false,
      nombre_blesses: typeof b.nombre_blesses === 'number' ? b.nombre_blesses : 0,
      dommages_materiels: typeof b.dommages_materiels === 'boolean' ? b.dommages_materiels : false,
      montant_estime: typeof b.montant_estime === 'number' ? b.montant_estime : undefined,
      vehicule_id: isValidUuid(b.vehicule_id) ? (b.vehicule_id as string) : undefined,
      vehicule_roulant: typeof b.vehicule_roulant === 'boolean' ? b.vehicule_roulant : undefined,
      tiers_impliques: Array.isArray(b.tiers_impliques) ? b.tiers_impliques : [],
    };
  },
};

export const createDevisSchema = {
  parse(body: unknown): CreateDevisInput {
    const b = body as Record<string, unknown>;
    if (!isNonEmptyString(b.type_assurance)) throw new Error('type_assurance est requis');

    return {
      type_assurance: (b.type_assurance as string).trim(),
      details: typeof b.details === 'object' && b.details !== null ? (b.details as Record<string, unknown>) : {},
    };
  },
};

export const sendMessageSchema = {
  parse(body: unknown): SendMessageInput {
    const b = body as Record<string, unknown>;
    if (!isNonEmptyString(b.message)) throw new Error('message est requis');
    return { message: (b.message as string).trim() };
  },
};

export const idParamSchema = {
  parse(params: unknown): IdParam {
    const p = params as Record<string, unknown>;
    if (!isValidUuid(p.id)) throw new Error('id invalide (UUID attendu)');
    return { id: p.id as string };
  },
};
