import type { Schema } from '../../middlewares/validate';

export interface PaymentIdParams {
    id: string;
}

export interface PaymentsListQuery {
    from?: string;
    to?: string;
    type?: string;
    contractId?: string;
}

export interface CreatePaymentInput {
    contrat_id: string;
    type_paiement: string;
    montant: number | string;
    date_paiement: string; // YYYY-MM-DD
    mode_paiement: string;
    notes?: string | null;
}

export interface UpdatePaymentInput {
    contrat_id?: string;
    type_paiement?: string;
    montant?: number | string;
    date_paiement?: string; // YYYY-MM-DD
    mode_paiement?: string;
    notes?: string | null;
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

export const paymentIdParamSchema: Schema<PaymentIdParams> = {
    parse(data: unknown): PaymentIdParams {
        const params = ensureObject(data);
        const id = params.id;
        if (typeof id !== 'string' || id.trim().length === 0) {
            throw new Error('Le paramètre "id" est obligatoire');
        }
        return { id: id.trim() };
    },
};

export const paymentsListQuerySchema: Schema<PaymentsListQuery> = {
    parse(data: unknown): PaymentsListQuery {
        const query = ensureObject(data);
        const from = typeof query.from === 'string' ? query.from.trim() : undefined;
        const to = typeof query.to === 'string' ? query.to.trim() : undefined;
        const type = typeof query.type === 'string' ? query.type.trim() : undefined;
        const contractId =
            typeof query.contractId === 'string' ? query.contractId.trim() : undefined;

        if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
            throw new Error('Le paramètre "from" doit être au format YYYY-MM-DD');
        }
        if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
            throw new Error('Le paramètre "to" doit être au format YYYY-MM-DD');
        }

        return { from, to, type, contractId };
    },
};

export const createPaymentSchema: Schema<CreatePaymentInput> = {
    parse(data: unknown): CreatePaymentInput {
        const body = ensureObject(data);
        return {
            contrat_id: ensureNonEmptyString(body.contrat_id, 'contrat_id'),
            type_paiement: ensureNonEmptyString(body.type_paiement, 'type_paiement'),
            montant: toNumberLike(body.montant, 'montant'),
            date_paiement: ensureDateString(body.date_paiement, 'date_paiement'),
            mode_paiement: ensureNonEmptyString(body.mode_paiement, 'mode_paiement'),
            notes: toNullableTrimmedString(body.notes) ?? undefined,
        };
    },
};

export const updatePaymentSchema: Schema<UpdatePaymentInput> = {
    parse(data: unknown): UpdatePaymentInput {
        const body = ensureObject(data);
        const result: UpdatePaymentInput = {};

        if ('contrat_id' in body) {
            if (typeof (body as any).contrat_id !== 'string') {
                throw new Error('Le champ "contrat_id" doit être une chaîne');
            }
            result.contrat_id = (body as any).contrat_id.trim();
        }

        if ('type_paiement' in body) {
            if (typeof (body as any).type_paiement !== 'string') {
                throw new Error('Le champ "type_paiement" doit être une chaîne');
            }
            result.type_paiement = (body as any).type_paiement.trim();
        }

        if ('montant' in body) {
            if ((body as any).montant === null) {
                throw new Error('Le champ "montant" ne peut pas être null');
            }
            result.montant = toNumberLike((body as any).montant, 'montant');
        }

        if ('date_paiement' in body) {
            if ((body as any).date_paiement === null) {
                throw new Error('Le champ "date_paiement" ne peut pas être null');
            }
            result.date_paiement = ensureDateString((body as any).date_paiement, 'date_paiement');
        }

        if ('mode_paiement' in body) {
            if (typeof (body as any).mode_paiement !== 'string') {
                throw new Error('Le champ "mode_paiement" doit être une chaîne');
            }
            result.mode_paiement = (body as any).mode_paiement.trim();
        }

        if ('notes' in body) {
            const v = toNullableTrimmedString((body as any).notes);
            if (typeof v !== 'undefined') result.notes = v;
        }

        return result;
    },
};



