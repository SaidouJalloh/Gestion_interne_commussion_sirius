import type { Schema } from '../../middlewares/validate';

export interface FolderIdParams {
  id: string;
}

export interface FoldersListQuery {
  parentId?: string;
}

export interface CreateFolderInput {
  nom: string;
  couleur?: string | null;
  parent_id?: string | null;
  contrat_id?: string | null;
  client_id?: string | null;
}

export interface UpdateFolderInput {
  nom?: string;
  couleur?: string | null;
  parent_id?: string | null;
  contrat_id?: string | null;
  client_id?: string | null;
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

export const folderIdParamSchema: Schema<FolderIdParams> = {
  parse(data: unknown): FolderIdParams {
    const params = ensureObject(data);
    const id = params.id;
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Le paramètre "id" est obligatoire');
    }
    return { id: id.trim() };
  },
};

export const foldersListQuerySchema: Schema<FoldersListQuery> = {
  parse(data: unknown): FoldersListQuery {
    const query = ensureObject(data);
    const parentId =
      typeof query.parentId === 'string' ? query.parentId.trim() : undefined;
    return { parentId: parentId && parentId.length > 0 ? parentId : undefined };
  },
};

export const createFolderSchema: Schema<CreateFolderInput> = {
  parse(data: unknown): CreateFolderInput {
    const body = ensureObject(data);
    return {
      nom: ensureNonEmptyString(body.nom, 'nom'),
      couleur: toNullableTrimmedString(body.couleur) ?? undefined,
      parent_id: toNullableTrimmedString(body.parent_id) ?? undefined,
      contrat_id: toNullableTrimmedString(body.contrat_id) ?? undefined,
      client_id: toNullableTrimmedString(body.client_id) ?? undefined,
    };
  },
};

export const updateFolderSchema: Schema<UpdateFolderInput> = {
  parse(data: unknown): UpdateFolderInput {
    const body = ensureObject(data);
    const result: UpdateFolderInput = {};

    if ('nom' in body) {
      if ((body as any).nom === null) throw new Error('Le champ "nom" ne peut pas être null');
      result.nom = ensureNonEmptyString((body as any).nom, 'nom');
    }

    if ('couleur' in body) {
      const v = toNullableTrimmedString((body as any).couleur);
      if (typeof v !== 'undefined') result.couleur = v;
    }

    if ('parent_id' in body) {
      const v = toNullableTrimmedString((body as any).parent_id);
      if (typeof v !== 'undefined') result.parent_id = v;
    }

    if ('contrat_id' in body) {
      const v = toNullableTrimmedString((body as any).contrat_id);
      if (typeof v !== 'undefined') result.contrat_id = v;
    }

    if ('client_id' in body) {
      const v = toNullableTrimmedString((body as any).client_id);
      if (typeof v !== 'undefined') result.client_id = v;
    }

    return result;
  },
};



