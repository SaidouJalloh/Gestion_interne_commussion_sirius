import { prisma } from '../../core/prisma';
import { Prisma } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
  created_by: string;
  admin_email?: string;
  admin_password?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
}

export interface InviteMemberInput {
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by: string;
}

export interface UpdateMemberRoleInput {
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export class OrganizationService {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Vérifier si un utilisateur est superadmin
   */
  private async isSuperAdmin(userId: string): Promise<boolean> {
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { is_superadmin: true },
    });
    return profile?.is_superadmin === true;
  }

  /**
   * Créer une nouvelle organisation
   * L'utilisateur créateur devient automatiquement owner
   * Si admin_email et admin_password sont fournis, un utilisateur admin est créé automatiquement
   */
  async create(payload: CreateOrganizationInput) {
    // Vérifier que le slug est unique
    const existing = await prisma.organizations.findUnique({
      where: { slug: payload.slug },
    });

    if (existing) {
      const error = new Error('Une organisation avec ce slug existe déjà') as Error & {
        status?: number;
      };
      error.status = 409;
      throw error;
    }

    // Valider que si admin_email est fourni, admin_password l'est aussi (et vice versa)
    if (
      (payload.admin_email && !payload.admin_password) ||
      (!payload.admin_email && payload.admin_password)
    ) {
      const error = new Error(
        'admin_email et admin_password doivent être fournis ensemble',
      ) as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // Si admin_email et admin_password sont fournis, on doit d'abord créer l'utilisateur
    // On le fait HORS de la transaction Prisma pour éviter les timeouts de transaction
    // liés aux appels API externes
    let adminUserId: string | null = null;

    if (payload.admin_email && payload.admin_password) {
      try {
        console.log('[OrganizationService] Création de l\'utilisateur admin dans Supabase...', payload.admin_email);
        adminUserId = await this.authService.createAdminUser(
          payload.admin_email,
          payload.admin_password,
        );
        console.log('[OrganizationService] Utilisateur admin créé avec succès:', adminUserId);
      } catch (error) {
        console.error('[OrganizationService] Erreur lors de la création de l\'utilisateur admin:', error);
        const err = error as Error & { status?: number };
        const errorMessage = err.message || 'Erreur inconnue lors de la création de l\'utilisateur admin';
        const errorStatus = err.status ?? 500;
        const finalError = new Error(errorMessage) as Error & { status?: number };
        finalError.status = errorStatus;
        throw finalError;
      }
    }

    try {
      // Créer l'organisation, le profil de l'admin et le membre admin en une transaction
      console.log('[OrganizationService] Début de la transaction de création d\'organisation...');
      const result = await prisma.$transaction(async (tx) => {
        const organization = await tx.organizations.create({
          data: {
            name: payload.name,
            slug: payload.slug,
            logo_url: payload.logo_url ?? null,
            settings: (payload.settings ?? {}) as Prisma.JsonObject,
            created_by: payload.created_by, // Le super admin qui crée l'organisation
          },
        });
        console.log('[OrganizationService] Organisation créée:', organization.id);

        // Si on a un admin créé précédemment, créer son profil et l'ajouter comme membre owner
        if (adminUserId && payload.admin_email) {
          // Créer le profil de l'utilisateur admin dans la table profiles
          await tx.profiles.create({
            data: {
              id: adminUserId,
              email: payload.admin_email,
              nom: payload.name.split(' ')[0] || payload.name, // Utiliser le nom de l'organisation comme nom par défaut
              prenom: payload.name.split(' ').slice(1).join(' ') || null,
              role: 'admin',
              actif: true,
            },
          });
          console.log('[OrganizationService] Profil admin créé dans profiles');

          // Ajouter l'admin comme membre owner de l'organisation (pas le super admin)
          await tx.organization_members.create({
            data: {
              organization_id: organization.id,
              user_id: adminUserId,
              role: 'owner', // L'admin créé devient owner de son organisation
              status: 'active',
              joined_at: new Date(),
            },
          });
          console.log('[OrganizationService] Membre admin créé comme owner de l\'organisation');
        }

        return organization;
      });

      console.log('[OrganizationService] Transaction terminée avec succès');
      return result;

    } catch (transactionError) {
      console.error('[OrganizationService] Échec de la transaction:', transactionError);

      // Si la transaction a échoué mais qu'on a créé un user, on log un avertissement
      if (adminUserId) {
        console.warn(
          `[OrganizationService] ATTENTION: Utilisateur auth ${adminUserId} créé mais la création de l'organisation a échoué. ` +
          'L\'utilisateur doit être supprimé manuellement si nécessaire.'
        );
      }

      // Propager l'erreur avec le bon format
      const err = transactionError as Error & { status?: number };
      const errorMessage = err.message || 'Erreur lors de la création de l\'organisation';
      const errorStatus = err.status ?? 500;
      const finalError = new Error(errorMessage) as Error & { status?: number };
      finalError.status = errorStatus;
      throw finalError;
    }
  }

  /**
   * Lister toutes les organisations d'un utilisateur
   * Si l'utilisateur est superadmin, retourne toutes les organisations
   */
  async getAllByUserId(userId: string) {
    // Vérifier si l'utilisateur est superadmin
    const isSuperAdmin = await this.isSuperAdmin(userId);

    if (isSuperAdmin) {
      // Pour les superadmins, retourner toutes les organisations
      const allOrganizations = await prisma.organizations.findMany({
        include: {
          _count: {
            select: { organization_members: true },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return allOrganizations.map((org) => {
        const { _count, ...orgData } = org as any;
        return {
          ...orgData,
          member_count: _count.organization_members,
          role: undefined, // Le superadmin n'a pas de rôle dans les organisations
          joined_at: undefined,
        };
      });
    }

    // Pour les utilisateurs normaux, retourner uniquement les organisations où ils sont membres
    const memberships = await prisma.organization_members.findMany({
      where: {
        user_id: userId,
        status: 'active',
      },
      include: {
        organizations: {
          include: {
            _count: {
              select: { organization_members: true },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return memberships.map((m) => {
      const { _count, ...orgData } = m.organizations as any;
      return {
        ...orgData,
        member_count: _count.organization_members,
        role: m.role,
        joined_at: m.joined_at,
      };
    });
  }

  /**
   * Obtenir les détails d'une organisation
   * Si l'utilisateur est superadmin, peut accéder à toutes les organisations
   */
  async getById(id: string, userId: string) {
    // Vérifier si l'utilisateur est superadmin
    const isSuperAdmin = await this.isSuperAdmin(userId);

    // Récupérer l'organisation
    const organization = await prisma.organizations.findUnique({
      where: { id },
    });

    if (!organization) {
      return null;
    }

    // Si superadmin, retourner l'organisation sans vérifier le membership
    if (isSuperAdmin) {
      return {
        ...organization,
        role: undefined, // Le superadmin n'a pas de rôle dans l'organisation
      };
    }

    // Pour les utilisateurs normaux, vérifier qu'ils sont membres
    const membership = await prisma.organization_members.findFirst({
      where: {
        organization_id: id,
        user_id: userId,
        status: 'active',
      },
    });

    if (!membership) {
      return null;
    }

    return {
      ...organization,
      role: membership.role,
    };
  }

  /**
   * Mettre à jour une organisation
   * Seuls les owners, admins et superadmins peuvent modifier
   */
  async update(
    id: string,
    userId: string,
    payload: UpdateOrganizationInput,
  ) {
    // Vérifier si l'utilisateur est superadmin
    const isSuperAdmin = await this.isSuperAdmin(userId);

    // Si pas superadmin, vérifier les permissions de membership
    if (!isSuperAdmin) {
      const membership = await prisma.organization_members.findFirst({
        where: {
          organization_id: id,
          user_id: userId,
          status: 'active',
        },
      });

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        const error = new Error(
          'Vous n\'avez pas les permissions pour modifier cette organisation',
        ) as Error & { status?: number };
        error.status = 403;
        throw error;
      }
    }

    const data: Prisma.organizationsUpdateInput = {};

    if (payload.name !== undefined) {
      data.name = payload.name;
    }

    if (payload.logo_url !== undefined) {
      data.logo_url = payload.logo_url ?? null;
    }

    if (payload.settings !== undefined) {
      data.settings = payload.settings as Prisma.JsonObject;
    }

    data.updated_at = new Date();

    const updated = await prisma.organizations.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Supprimer une organisation
   * Seuls les owners et superadmins peuvent supprimer
   */
  async delete(id: string, userId: string) {
    // Vérifier si l'utilisateur est superadmin
    const isSuperAdmin = await this.isSuperAdmin(userId);

    // Si pas superadmin, vérifier que l'utilisateur est owner
    if (!isSuperAdmin) {
      const membership = await prisma.organization_members.findFirst({
        where: {
          organization_id: id,
          user_id: userId,
          status: 'active',
        },
      });

      if (!membership || membership.role !== 'owner') {
        const error = new Error(
          'Seuls les propriétaires peuvent supprimer une organisation',
        ) as Error & { status?: number };
        error.status = 403;
        throw error;
      }
    }

    // Supprimer l'organisation (cascade supprimera les membres et données associées)
    await prisma.organizations.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Inviter un utilisateur à rejoindre l'organisation
   * Nécessite de trouver l'utilisateur par email depuis auth.users
   */
  async inviteMember(
    organizationId: string,
    userId: string,
    payload: InviteMemberInput,
  ) {
    // Vérifier les permissions (owner ou admin)
    const membership = await prisma.organization_members.findFirst({
      where: {
        organization_id: organizationId,
        user_id: userId,
        status: 'active',
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      const error = new Error(
        'Vous n\'avez pas les permissions pour inviter des membres',
      ) as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // Note: Pour trouver l'utilisateur par email, on devra utiliser Supabase Admin API
    // ou créer une table de mapping email -> user_id
    // Pour l'instant, on suppose que user_id sera fourni directement ou récupéré ailleurs

    // Vérifier que l'utilisateur n'est pas déjà membre
    // Note: Cette méthode nécessite de connaître le user_id de l'email
    // Pour l'instant, on retourne une erreur indiquant que cette fonctionnalité nécessite
    // une intégration avec Supabase Admin API

    const error = new Error(
      'L\'invitation par email nécessite une intégration avec Supabase Admin API',
    ) as Error & { status?: number };
    error.status = 501;
    throw error;
  }

  /**
   * Inviter un utilisateur par user_id (méthode alternative)
   */
  async inviteMemberByUserId(
    organizationId: string,
    inviterUserId: string,
    targetUserId: string,
    role: 'owner' | 'admin' | 'member' | 'viewer',
  ) {
    // Vérifier les permissions
    const membership = await prisma.organization_members.findFirst({
      where: {
        organization_id: organizationId,
        user_id: inviterUserId,
        status: 'active',
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      const error = new Error(
        'Vous n\'avez pas les permissions pour inviter des membres',
      ) as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existing = await prisma.organization_members.findFirst({
      where: {
        organization_id: organizationId,
        user_id: targetUserId,
      },
    });

    if (existing) {
      if (existing.status === 'active') {
        const error = new Error('Cet utilisateur est déjà membre de l\'organisation') as Error & {
          status?: number;
        };
        error.status = 409;
        throw error;
      } else {
        // Réactiver l'invitation
        return await prisma.organization_members.update({
          where: { id: existing.id },
          data: {
            role,
            status: 'pending',
            invited_by: inviterUserId,
            invited_at: new Date(),
          },
        });
      }
    }

    // Créer l'invitation
    return await prisma.organization_members.create({
      data: {
        organization_id: organizationId,
        user_id: targetUserId,
        role,
        status: 'pending',
        invited_by: inviterUserId,
      },
    });
  }

  /**
   * Accepter une invitation
   */
  async acceptInvitation(organizationId: string, userId: string) {
    const membership = await prisma.organization_members.findFirst({
      where: {
        organization_id: organizationId,
        user_id: userId,
        status: 'pending',
      },
    });

    if (!membership) {
      const error = new Error('Aucune invitation trouvée') as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    return await prisma.organization_members.update({
      where: { id: membership.id },
      data: {
        status: 'active',
        joined_at: new Date(),
      },
    });
  }

  /**
   * Modifier le rôle d'un membre
   */
  async updateMemberRole(
    organizationId: string,
    userId: string,
    membershipId: string,
    payload: UpdateMemberRoleInput,
  ) {
    // Vérifier les permissions (owner ou admin)
    const membership = await prisma.organization_members.findFirst({
      where: {
        organization_id: organizationId,
        user_id: userId,
        status: 'active',
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      const error = new Error(
        'Vous n\'avez pas les permissions pour modifier les rôles',
      ) as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // Récupérer le membre cible par son ID de membership
    const target = await prisma.organization_members.findFirst({
      where: {
        id: membershipId,
        organization_id: organizationId,
      },
    });

    if (!target) {
      const error = new Error('Membre non trouvé') as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // Les admins ne peuvent pas modifier les owners
    if (membership.role === 'admin' && target.role === 'owner') {
      const error = new Error(
        'Les admins ne peuvent pas modifier les propriétaires',
      ) as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    return await prisma.organization_members.update({
      where: { id: membershipId },
      data: {
        role: payload.role,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Retirer un membre de l'organisation
   */
  async removeMember(
    organizationId: string,
    userId: string,
    membershipId: string,
  ) {
    // Vérifier les permissions (owner ou admin)
    const membership = await prisma.organization_members.findFirst({
      where: {
        organization_id: organizationId,
        user_id: userId,
        status: 'active',
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      const error = new Error(
        'Vous n\'avez pas les permissions pour retirer des membres',
      ) as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // Récupérer le membre cible par son ID de membership
    const target = await prisma.organization_members.findFirst({
      where: {
        id: membershipId,
        organization_id: organizationId,
      },
    });

    if (!target) {
      const error = new Error('Membre non trouvé') as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (target.role === 'owner' && target.user_id !== userId) {
      const error = new Error(
        'Les propriétaires ne peuvent pas être retirés par d\'autres membres',
      ) as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // Marquer comme inactive plutôt que supprimer pour garder l'historique
    return await prisma.organization_members.update({
      where: { id: membershipId },
      data: {
        status: 'inactive',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Lister les membres d'une organisation
   * Les superadmins peuvent voir les membres de toutes les organisations
   */
  async getMembers(organizationId: string, userId: string) {
    // Vérifier si l'utilisateur est superadmin
    const isSuperAdmin = await this.isSuperAdmin(userId);

    // Si pas superadmin, vérifier que l'utilisateur appartient à l'organisation
    if (!isSuperAdmin) {
      const membership = await prisma.organization_members.findFirst({
        where: {
          organization_id: organizationId,
          user_id: userId,
          status: 'active',
        },
      });

      if (!membership) {
        const error = new Error(
          'Vous n\'avez pas accès à cette organisation',
        ) as Error & { status?: number };
        error.status = 403;
        throw error;
      }
    }

    const members = await prisma.organization_members.findMany({
      where: {
        organization_id: organizationId,
      },
      orderBy: [
        { role: 'asc' },
        { created_at: 'asc' },
      ],
    });

    return members;
  }
}
