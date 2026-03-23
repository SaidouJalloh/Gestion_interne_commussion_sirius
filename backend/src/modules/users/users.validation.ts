import type { Schema } from '../../middlewares/validate';

export interface CreateUserInput {
  email: string;
  password?: string;
  nom?: string;
  prenom?: string;
  role: 'user' | 'gestionnaire' | 'admin' | 'superadmin';
  telephone?: string;
  actif: boolean;
}

export interface UpdateUserInput {
  nom?: string;
  prenom?: string;
  role: 'user' | 'gestionnaire' | 'admin' | 'superadmin';
  telephone?: string;
  actif: boolean;
}

const ensureObject = (data: unknown): Record<string, unknown> => {
  if (data === null || typeof data !== 'object') {
    throw new Error('Payload invalide');
  }
  return data as Record<string, unknown>;
};

const toTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') throw new Error('Valeur doit être une chaîne');
  return value.trim();
};

const toOptionalTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createUserSchema: Schema<CreateUserInput> = {
  parse(data: unknown): CreateUserInput {
    const body = ensureObject(data);

    const email = toTrimmedString(body.email);
    if (!isValidEmail(email)) throw new Error('Email invalide');

    const password = toOptionalTrimmedString(body.password);
    if (password && password.length < 6) throw new Error('Min 6 caractères');

    const nom = toOptionalTrimmedString(body.nom);
    const prenom = toOptionalTrimmedString(body.prenom);
    const telephone = toOptionalTrimmedString(body.telephone);

    const role = toTrimmedString(body.role);
    if (!['user', 'gestionnaire', 'admin', 'superadmin'].includes(role)) {
      throw new Error('Rôle invalide');
    }

    const actif = typeof body.actif === 'boolean' ? body.actif : true;

    return {
      email,
      password,
      nom,
      prenom,
      telephone,
      role: role as 'user' | 'gestionnaire' | 'admin' | 'superadmin',
      actif,
    };
  },
};

export const updateUserSchema: Schema<UpdateUserInput> = {
  parse(data: unknown): UpdateUserInput {
    const body = ensureObject(data);

    const nom = toOptionalTrimmedString(body.nom);
    const prenom = toOptionalTrimmedString(body.prenom);
    const telephone = toOptionalTrimmedString(body.telephone);

    const role = toTrimmedString(body.role);
    if (!['user', 'gestionnaire', 'admin', 'superadmin'].includes(role)) {
      throw new Error('Rôle invalide');
    }

    const actif = typeof body.actif === 'boolean' ? body.actif : true;

    return {
      nom,
      prenom,
      telephone,
      role: role as 'user' | 'gestionnaire' | 'admin' | 'superadmin',
      actif,
    };
  },
};
