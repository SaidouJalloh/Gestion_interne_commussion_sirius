import type { Schema } from '../../middlewares/validate';

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logo_url?: string | null;
  settings?: Record<string, unknown>;
  admin_email?: string;
  admin_password?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  logo_url?: string | null;
  settings?: Record<string, unknown>;
}

export interface InviteMemberInput {
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface UpdateMemberRoleInput {
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

const ensureObject = (data: unknown): Record<string, unknown> => {
  if (data === null || typeof data !== 'object') {
    throw new Error('Payload invalide');
  }
  return data as Record<string, unknown>;
};

const toTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new Error('Valeur doit être une chaîne de caractères');
  }
  return value.trim();
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

const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug);
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidUuid = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createOrganizationSchema: Schema<CreateOrganizationInput> = {
  parse(data: unknown): CreateOrganizationInput {
    const body = ensureObject(data);

    const name = toTrimmedString(body.name);
    if (name.length === 0) throw new Error('Le nom est requis');
    if (name.length > 255) throw new Error('Le nom ne peut pas dépasser 255 caractères');

    const slug = toTrimmedString(body.slug);
    if (slug.length === 0) throw new Error('Le slug est requis');
    if (slug.length > 100) throw new Error('Le slug ne peut pas dépasser 100 caractères');
    if (!isValidSlug(slug)) {
      throw new Error('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets');
    }

    let logo_url: string | null | undefined = undefined;
    if ('logo_url' in body) {
      const v = toNullableTrimmedString(body.logo_url);
      if (v !== null && v !== undefined && !isValidUrl(v)) {
        throw new Error('logo_url doit être une URL valide');
      }
      logo_url = v;
    }

    let settings: Record<string, unknown> | undefined = undefined;
    if ('settings' in body && body.settings !== null && typeof body.settings === 'object') {
      settings = body.settings as Record<string, unknown>;
    }

    // Validation des champs admin (optionnels mais doivent être fournis ensemble)
    let admin_email: string | undefined = undefined;
    let admin_password: string | undefined = undefined;

    if ('admin_email' in body) {
      const emailValue = toOptionalTrimmedString(body.admin_email);
      if (emailValue) {
        if (!isValidEmail(emailValue)) {
          throw new Error('admin_email doit être une adresse email valide');
        }
        admin_email = emailValue;
      }
    }

    if ('admin_password' in body) {
      const passwordValue = toOptionalTrimmedString(body.admin_password);
      if (passwordValue) {
        if (passwordValue.length < 8) {
          throw new Error(
            'admin_password doit contenir au moins 8 caractères',
          );
        }
        admin_password = passwordValue;
      }
    }

    // Si un des deux champs admin est fourni, l'autre doit l'être aussi
    if (
      (admin_email && !admin_password) ||
      (!admin_email && admin_password)
    ) {
      throw new Error(
        'admin_email et admin_password doivent être fournis ensemble',
      );
    }

    return {
      name,
      slug,
      logo_url,
      settings,
      admin_email,
      admin_password,
    };
  },
};

export const updateOrganizationSchema: Schema<UpdateOrganizationInput> = {
  parse(data: unknown): UpdateOrganizationInput {
    const body = ensureObject(data);
    const result: UpdateOrganizationInput = {};

    if ('name' in body) {
      const v = toTrimmedString(body.name);
      if (v.length === 0) throw new Error('Le nom ne peut pas être vide');
      if (v.length > 255) throw new Error('Le nom ne peut pas dépasser 255 caractères');
      result.name = v;
    }

    if ('logo_url' in body) {
      const v = toNullableTrimmedString(body.logo_url);
      if (v !== null && v !== undefined && !isValidUrl(v)) {
        throw new Error('logo_url doit être une URL valide');
      }
      result.logo_url = v;
    }

    if ('settings' in body && body.settings !== null && typeof body.settings === 'object') {
      result.settings = body.settings as Record<string, unknown>;
    }

    return result;
  },
};

export const inviteMemberSchema: Schema<InviteMemberInput> = {
  parse(data: unknown): InviteMemberInput {
    const body = ensureObject(data);

    const user_id = toTrimmedString(body.user_id);
    if (!isValidUuid(user_id)) {
      throw new Error('user_id doit être un UUID valide');
    }

    const role = toTrimmedString(body.role);
    if (!['owner', 'admin', 'member', 'viewer'].includes(role)) {
      throw new Error('Le rôle doit être owner, admin, member ou viewer');
    }

    return {
      user_id,
      role: role as 'owner' | 'admin' | 'member' | 'viewer',
    };
  },
};

export const updateMemberRoleSchema: Schema<UpdateMemberRoleInput> = {
  parse(data: unknown): UpdateMemberRoleInput {
    const body = ensureObject(data);

    const role = toTrimmedString(body.role);
    if (!['owner', 'admin', 'member', 'viewer'].includes(role)) {
      throw new Error('Le rôle doit être owner, admin, member ou viewer');
    }

    return {
      role: role as 'owner' | 'admin' | 'member' | 'viewer',
    };
  },
};

export interface OrganizationIdParams {
  id: string;
}

export interface MemberIdParams {
  organizationId: string;
  memberId: string;
}
