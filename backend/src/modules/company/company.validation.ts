import type { Schema } from '../../middlewares/validate';

export interface CreateCompanyInput {
    nom: string;
    sigle: string;
    description?: string;
    logo_url?: string | null;
    lien_souscription?: string | null;
    actif?: boolean;
}

export interface UpdateCompanyInput {
    nom?: string;
    sigle?: string;
    description?: string;
    logo_url?: string | null;
    lien_souscription?: string | null;
    actif?: boolean;
    // JSON libre pour conserver la flexibilité actuelle des taux
    // et rester compatible avec le type Json du modèle Prisma.
    taux_commissions?: any;
}

export interface CompanyIdParams {
    id: string;
}

const ensureObject = (data: unknown): Record<string, unknown> => {
    if (data === null || typeof data !== 'object') {
        throw new Error('Payload invalide');
    }
    return data as Record<string, unknown>;
};

export const createCompanySchema: Schema<CreateCompanyInput> = {
    parse(data: unknown): CreateCompanyInput {
        const body = ensureObject(data);

        const nom = body.nom;
        const sigle = body.sigle;

        if (typeof nom !== 'string' || nom.trim().length === 0) {
            throw new Error('Le champ "nom" est obligatoire');
        }

        if (typeof sigle !== 'string' || sigle.trim().length === 0) {
            throw new Error('Le champ "sigle" est obligatoire');
        }

        const description =
            typeof body.description === 'string' ? body.description : undefined;
        const logo_url =
            typeof body.logo_url === 'string' ? body.logo_url : undefined;
        const lien_souscription =
            typeof body.lien_souscription === 'string'
                ? body.lien_souscription
                : undefined;

        const actif =
            typeof body.actif === 'boolean' ? body.actif : (true as boolean);

        return {
            nom,
            sigle,
            description,
            logo_url,
            lien_souscription,
            actif,
        };
    },
};

export const updateCompanySchema: Schema<UpdateCompanyInput> = {
    parse(data: unknown): UpdateCompanyInput {
        const body = ensureObject(data);

        const result: UpdateCompanyInput = {};

        if ('nom' in body && typeof body.nom === 'string') {
            result.nom = body.nom;
        }

        if ('sigle' in body && typeof body.sigle === 'string') {
            result.sigle = body.sigle;
        }

        if ('description' in body && typeof body.description === 'string') {
            result.description = body.description;
        }

        if ('logo_url' in body) {
            if (
                typeof body.logo_url === 'string' ||
                body.logo_url === null ||
                typeof body.logo_url === 'undefined'
            ) {
                result.logo_url = body.logo_url as string | null | undefined;
            } else {
                throw new Error('Le champ "logo_url" doit être une chaîne ou null');
            }
        }

        if ('lien_souscription' in body) {
            if (
                typeof body.lien_souscription === 'string' ||
                body.lien_souscription === null ||
                typeof body.lien_souscription === 'undefined'
            ) {
                result.lien_souscription = body.lien_souscription as
                    | string
                    | null
                    | undefined;
            } else {
                throw new Error(
                    'Le champ "lien_souscription" doit être une chaîne ou null',
                );
            }
        }

        if ('actif' in body) {
            if (typeof body.actif === 'boolean') {
                result.actif = body.actif;
            } else {
                throw new Error('Le champ "actif" doit être un booléen');
            }
        }

        if ('taux_commissions' in body) {
            result.taux_commissions = body.taux_commissions;
        }

        return result;
    },
};

export const companyIdParamSchema: Schema<CompanyIdParams> = {
    parse(data: unknown): CompanyIdParams {
        const params = ensureObject(data);
        const id = params.id;

        if (typeof id !== 'string' || id.trim().length === 0) {
            throw new Error('Le paramètre "id" est obligatoire');
        }

        return { id };
    },
};
