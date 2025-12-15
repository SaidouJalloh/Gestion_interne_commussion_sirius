import type { Schema } from '../../middlewares/validate';

export interface MediaIdParams {
  id: string;
}

export interface MediaListQuery {
  folderId?: string;
  trashed?: boolean;
}

export interface CreateMediaInput {
  nom: string;
  type_fichier?: string | null;
  taille?: number | string | null;
  url: string;
  dossier_id?: string | null;
  contrat_id?: string | null;
  client_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface UpdateMediaInput {
  nom?: string;
  type_fichier?: string | null;
  taille?: number | string | null;
  url?: string;
  dossier_id?: string | null;
  contrat_id?: string | null;
  client_id?: string | null;
  notes?: string | null;
}

const ensureObject = (data: unknown): Record<string, unknown> => {
  if (data === null || typeof data !== 'object') throw new Error('Payload invalide');
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

const toNullableBigIntLike = (value: unknown): string | number | null | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (value === null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return undefined;
};

const toBooleanLike = (value: unknown): boolean | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  return undefined;
};

export const mediaIdParamSchema: Schema<MediaIdParams> = {
  parse(data: unknown): MediaIdParams {
    const params = ensureObject(data);
    const id = params.id;
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Le paramètre "id" est obligatoire');
    }
    return { id: id.trim() };
  },
};

export const mediaListQuerySchema: Schema<MediaListQuery> = {
  parse(data: unknown): MediaListQuery {
    const query = ensureObject(data);
    const folderId = typeof query.folderId === 'string' ? query.folderId.trim() : undefined;
    const trashed = toBooleanLike(query.trashed);
    return {
      folderId: folderId && folderId.length > 0 ? folderId : undefined,
      trashed,
    };
  },
};

export const createMediaSchema: Schema<CreateMediaInput> = {
  parse(data: unknown): CreateMediaInput {
    const body = ensureObject(data);
    return {
      nom: ensureNonEmptyString(body.nom, 'nom'),
      type_fichier: toNullableTrimmedString(body.type_fichier) ?? undefined,
      taille: toNullableBigIntLike(body.taille) ?? undefined,
      url: ensureNonEmptyString(body.url, 'url'),
      dossier_id: toNullableTrimmedString(body.dossier_id) ?? undefined,
      contrat_id: toNullableTrimmedString(body.contrat_id) ?? undefined,
      client_id: toNullableTrimmedString(body.client_id) ?? undefined,
      notes: toNullableTrimmedString(body.notes) ?? undefined,
      created_by: toNullableTrimmedString(body.created_by) ?? undefined,
    };
  },
};

export const updateMediaSchema: Schema<UpdateMediaInput> = {
  parse(data: unknown): UpdateMediaInput {
    const body = ensureObject(data);
    const result: UpdateMediaInput = {};

    if ('nom' in body) {
      if ((body as any).nom === null) throw new Error('Le champ "nom" ne peut pas être null');
      result.nom = ensureNonEmptyString((body as any).nom, 'nom');
    }

    if ('type_fichier' in body) {
      const v = toNullableTrimmedString((body as any).type_fichier);
      if (typeof v !== 'undefined') result.type_fichier = v;
    }

    if ('taille' in body) {
      const v = toNullableBigIntLike((body as any).taille);
      if (typeof v !== 'undefined') result.taille = v;
    }

    if ('url' in body) {
      if ((body as any).url === null) throw new Error('Le champ "url" ne peut pas être null');
      result.url = ensureNonEmptyString((body as any).url, 'url');
    }

    if ('dossier_id' in body) {
      const v = toNullableTrimmedString((body as any).dossier_id);
      if (typeof v !== 'undefined') result.dossier_id = v;
    }

    if ('contrat_id' in body) {
      const v = toNullableTrimmedString((body as any).contrat_id);
      if (typeof v !== 'undefined') result.contrat_id = v;
    }

    if ('client_id' in body) {
      const v = toNullableTrimmedString((body as any).client_id);
      if (typeof v !== 'undefined') result.client_id = v;
    }

    if ('notes' in body) {
      const v = toNullableTrimmedString((body as any).notes);
      if (typeof v !== 'undefined') result.notes = v;
    }

    return result;
  },
};



