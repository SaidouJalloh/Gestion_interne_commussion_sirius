import type { Schema } from '../../middlewares/validate';

export interface CreateContractInput {
    client_id: string;
    compagnie_id: string;
    type_contrat: string;
    prime_nette: number | string;
    montant_accessoire?: number | string | null;
    taux_commission: number | string;
    commission: number | string;
    date_effet: string;
    date_expiration: string;
    statut?: string | null;
    fractionnement?: string | null;
    notes?: string | null;
    evacuation_sanitaire?: number | string | null;
    prime_regulation?: number | string | null;
    immatriculation?: string | null;
    prime_ttc?: number | string | null;
    fga?: number | string | null;
    taxes?: number | string | null;
    is_flotte?: boolean;
    prime_ttc_initial?: number | string | null;
}

export interface UpdateContractInput
    extends Partial<Omit<CreateContractInput, 'client_id' | 'compagnie_id'>> {
    client_id?: string;
    compagnie_id?: string;
}

export interface ContractIdParams {
    id: string;
}

const ensureObject = (data: unknown): Record<string, unknown> => {
    if (data === null || typeof data !== 'object') {
        throw new Error('Payload invalide');
    }
    return data as Record<string, unknown>;
};

const ensureUuidString = (value: unknown, field: string): string => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Le champ "${field}" est obligatoire`);
    }
    return value.trim();
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

const toNullableNumberLike = (
    value: unknown,
): number | string | null | undefined => {
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

const ensureDateString = (value: unknown, field: string): string => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Le champ "${field}" est obligatoire`);
    }
    const v = value.trim();
    // Format attendu: YYYY-MM-DD (comme utilisé dans le frontend)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        throw new Error(`Le champ "${field}" doit être au format YYYY-MM-DD`);
    }
    return v;
};

export const createContractSchema: Schema<CreateContractInput> = {
    parse(data: unknown): CreateContractInput {
        const body = ensureObject(data);

        const client_id = ensureUuidString(body.client_id, 'client_id');
        const compagnie_id = ensureUuidString(body.compagnie_id, 'compagnie_id');
        const type_contrat = ensureNonEmptyString(body.type_contrat, 'type_contrat');

        const prime_nette = toNullableNumberLike(body.prime_nette);
        const taux_commission = toNullableNumberLike(body.taux_commission);
        const commission = toNullableNumberLike(body.commission);

        if (prime_nette === null || typeof prime_nette === 'undefined') {
            throw new Error('Le champ "prime_nette" est obligatoire');
        }
        if (taux_commission === null || typeof taux_commission === 'undefined') {
            throw new Error('Le champ "taux_commission" est obligatoire');
        }
        if (commission === null || typeof commission === 'undefined') {
            throw new Error('Le champ "commission" est obligatoire');
        }

        const date_effet = ensureDateString(body.date_effet, 'date_effet');
        const date_expiration = ensureDateString(body.date_expiration, 'date_expiration');

        return {
            client_id,
            compagnie_id,
            type_contrat,
            prime_nette,
            montant_accessoire: toNullableNumberLike(body.montant_accessoire) ?? null,
            taux_commission,
            commission,
            date_effet,
            date_expiration,
            statut: toNullableTrimmedString(body.statut) ?? undefined,
            fractionnement: toNullableTrimmedString(body.fractionnement) ?? undefined,
            notes: toNullableTrimmedString(body.notes) ?? undefined,
            evacuation_sanitaire: toNullableNumberLike(body.evacuation_sanitaire) ?? undefined,
            prime_regulation: toNullableNumberLike(body.prime_regulation) ?? undefined,
            immatriculation: toNullableTrimmedString(body.immatriculation) ?? undefined,
            prime_ttc: toNullableNumberLike(body.prime_ttc) ?? undefined,
            fga: toNullableNumberLike(body.fga) ?? undefined,
            taxes: toNullableNumberLike(body.taxes) ?? undefined,
            is_flotte: typeof body.is_flotte === 'boolean' ? body.is_flotte : undefined,
            prime_ttc_initial: toNullableNumberLike(body.prime_ttc_initial) ?? undefined,
        };
    },
};

export const updateContractSchema: Schema<UpdateContractInput> = {
    parse(data: unknown): UpdateContractInput {
        const body = ensureObject(data);
        const result: UpdateContractInput = {};

        if ('client_id' in body) {
            if (typeof body.client_id === 'string') {
                result.client_id = body.client_id.trim();
            } else {
                throw new Error('Le champ "client_id" doit être une chaîne');
            }
        }

        if ('compagnie_id' in body) {
            if (typeof body.compagnie_id === 'string') {
                result.compagnie_id = body.compagnie_id.trim();
            } else {
                throw new Error('Le champ "compagnie_id" doit être une chaîne');
            }
        }

        if ('type_contrat' in body && typeof body.type_contrat === 'string') {
            result.type_contrat = body.type_contrat.trim();
        }

        if ('prime_nette' in body) {
            const v = toNullableNumberLike((body as any).prime_nette);
            if (v === null) {
                throw new Error('Le champ "prime_nette" ne peut pas être null');
            }
            if (typeof v !== 'undefined') result.prime_nette = v;
        }

        if ('montant_accessoire' in body) {
            const v = toNullableNumberLike((body as any).montant_accessoire);
            if (typeof v !== 'undefined') result.montant_accessoire = v;
        }

        if ('taux_commission' in body) {
            const v = toNullableNumberLike((body as any).taux_commission);
            if (v === null) {
                throw new Error('Le champ "taux_commission" ne peut pas être null');
            }
            if (typeof v !== 'undefined') result.taux_commission = v;
        }

        if ('commission' in body) {
            const v = toNullableNumberLike((body as any).commission);
            if (v === null) {
                throw new Error('Le champ "commission" ne peut pas être null');
            }
            if (typeof v !== 'undefined') result.commission = v;
        }

        if ('date_effet' in body) {
            result.date_effet = ensureDateString((body as any).date_effet, 'date_effet');
        }

        if ('date_expiration' in body) {
            result.date_expiration = ensureDateString(
                (body as any).date_expiration,
                'date_expiration',
            );
        }

        if ('statut' in body) {
            const v = toNullableTrimmedString((body as any).statut);
            if (typeof v !== 'undefined') result.statut = v;
        }

        if ('fractionnement' in body) {
            const v = toNullableTrimmedString((body as any).fractionnement);
            if (typeof v !== 'undefined') result.fractionnement = v;
        }

        if ('notes' in body) {
            const v = toNullableTrimmedString((body as any).notes);
            if (typeof v !== 'undefined') result.notes = v;
        }

        if ('evacuation_sanitaire' in body) {
            const v = toNullableNumberLike((body as any).evacuation_sanitaire);
            if (typeof v !== 'undefined') result.evacuation_sanitaire = v;
        }

        if ('prime_regulation' in body) {
            const v = toNullableNumberLike((body as any).prime_regulation);
            if (typeof v !== 'undefined') result.prime_regulation = v;
        }

        if ('immatriculation' in body) {
            const v = toNullableTrimmedString((body as any).immatriculation);
            if (typeof v !== 'undefined') result.immatriculation = v;
        }

        if ('prime_ttc' in body) {
            const v = toNullableNumberLike((body as any).prime_ttc);
            if (typeof v !== 'undefined') result.prime_ttc = v;
        }

        if ('fga' in body) {
            const v = toNullableNumberLike((body as any).fga);
            if (typeof v !== 'undefined') result.fga = v;
        }

        if ('taxes' in body) {
            const v = toNullableNumberLike((body as any).taxes);
            if (typeof v !== 'undefined') result.taxes = v;
        }

        if ('is_flotte' in body) {
            if (typeof (body as any).is_flotte === 'boolean') {
                result.is_flotte = (body as any).is_flotte;
            } else {
                throw new Error('Le champ "is_flotte" doit être un booléen');
            }
        }

        if ('prime_ttc_initial' in body) {
            const v = toNullableNumberLike((body as any).prime_ttc_initial);
            if (typeof v !== 'undefined') result.prime_ttc_initial = v;
        }

        return result;
    },
};

export const contractIdParamSchema: Schema<ContractIdParams> = {
    parse(data: unknown): ContractIdParams {
        const params = ensureObject(data);
        const id = params.id;
        if (typeof id !== 'string' || id.trim().length === 0) {
            throw new Error('Le paramètre "id" est obligatoire');
        }
        return { id: id.trim() };
    },
};


