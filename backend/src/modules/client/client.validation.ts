import type { Schema } from '../../middlewares/validate';

export interface CreateClientInput {
    nom: string;
    prenom: string;
    email?: string | null;
    telephone?: string | null;
    type_client: string;
    adresse?: string | null;
    ville?: string | null;
    code_postal?: string | null;
    notes?: string | null;
    created_by?: string | null;
}

export interface UpdateClientInput {
    nom?: string;
    prenom?: string;
    email?: string | null;
    telephone?: string | null;
    type_client?: string;
    adresse?: string | null;
    ville?: string | null;
    code_postal?: string | null;
    notes?: string | null;
}

export interface ClientIdParams {
    id: string;
}

const ensureObject = (data: unknown): Record<string, unknown> => {
    if (data === null || typeof data !== 'object') {
        throw new Error('Payload invalide');
    }
    return data as Record<string, unknown>;
};

const toOptionalTrimmedString = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const toNullableTrimmedString = (value: unknown): string | null | undefined => {
    if (typeof value === 'undefined') return undefined;
    if (value === null) return null;
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

export const createClientSchema: Schema<CreateClientInput> = {
    parse(data: unknown): CreateClientInput {
        const body = ensureObject(data);

        // Ignorer organization_id du body (sécurité - vient toujours du middleware tenant)
        const { organization_id, ...cleanBody } = body;

        const nom = toOptionalTrimmedString(cleanBody.nom);
        const prenom = toOptionalTrimmedString(cleanBody.prenom);
        const type_client = toOptionalTrimmedString(cleanBody.type_client);

        if (!nom) throw new Error('Le champ "nom" est obligatoire');
        if (!prenom) throw new Error('Le champ "prenom" est obligatoire');
        if (!type_client) throw new Error('Le champ "type_client" est obligatoire');

        const email = toNullableTrimmedString(cleanBody.email);
        const telephone = toNullableTrimmedString(cleanBody.telephone);
        const adresse = toNullableTrimmedString(cleanBody.adresse);
        const ville = toNullableTrimmedString(cleanBody.ville);
        const code_postal = toNullableTrimmedString(cleanBody.code_postal);
        const notes = toNullableTrimmedString(cleanBody.notes);
        const created_by = toNullableTrimmedString(cleanBody.created_by);

        return {
            nom,
            prenom,
            type_client,
            email: typeof email === 'undefined' ? undefined : email,
            telephone: typeof telephone === 'undefined' ? undefined : telephone,
            adresse: typeof adresse === 'undefined' ? undefined : adresse,
            ville: typeof ville === 'undefined' ? undefined : ville,
            code_postal: typeof code_postal === 'undefined' ? undefined : code_postal,
            notes: typeof notes === 'undefined' ? undefined : notes,
            created_by: typeof created_by === 'undefined' ? undefined : created_by,
        };
    },
};

export const updateClientSchema: Schema<UpdateClientInput> = {
    parse(data: unknown): UpdateClientInput {
        const body = ensureObject(data);
        const result: UpdateClientInput = {};

        if ('nom' in body && typeof body.nom === 'string') {
            const v = body.nom.trim();
            if (v.length === 0) throw new Error('Le champ "nom" ne peut pas être vide');
            result.nom = v;
        }

        if ('prenom' in body && typeof body.prenom === 'string') {
            const v = body.prenom.trim();
            if (v.length === 0) throw new Error('Le champ "prenom" ne peut pas être vide');
            result.prenom = v;
        }

        if ('type_client' in body && typeof body.type_client === 'string') {
            const v = body.type_client.trim();
            if (v.length === 0)
                throw new Error('Le champ "type_client" ne peut pas être vide');
            result.type_client = v;
        }

        if ('email' in body) {
            const v = toNullableTrimmedString((body as any).email);
            if (typeof v !== 'undefined') result.email = v;
        }

        if ('telephone' in body) {
            const v = toNullableTrimmedString((body as any).telephone);
            if (typeof v !== 'undefined') result.telephone = v;
        }

        if ('adresse' in body) {
            const v = toNullableTrimmedString((body as any).adresse);
            if (typeof v !== 'undefined') result.adresse = v;
        }

        if ('ville' in body) {
            const v = toNullableTrimmedString((body as any).ville);
            if (typeof v !== 'undefined') result.ville = v;
        }

        if ('code_postal' in body) {
            const v = toNullableTrimmedString((body as any).code_postal);
            if (typeof v !== 'undefined') result.code_postal = v;
        }

        if ('notes' in body) {
            const v = toNullableTrimmedString((body as any).notes);
            if (typeof v !== 'undefined') result.notes = v;
        }

        return result;
    },
};

export const clientIdParamSchema: Schema<ClientIdParams> = {
    parse(data: unknown): ClientIdParams {
        const params = ensureObject(data);
        const id = params.id;
        if (typeof id !== 'string' || id.trim().length === 0) {
            throw new Error('Le paramètre "id" est obligatoire');
        }
        return { id: id.trim() };
    },
};








