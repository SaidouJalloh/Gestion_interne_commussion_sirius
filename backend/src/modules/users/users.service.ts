import { PrismaClient } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

const prisma = new PrismaClient();

export class UsersService {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async createUser(data: {
    email: string;
    password?: string;
    nom?: string;
    prenom?: string;
    role: string;
    telephone?: string;
    actif: boolean;
  }, callerId: string, organizationId?: string) {
    // 1. Check caller permissions
    const callerProfile = await prisma.profiles.findUnique({ where: { id: callerId } });
    if (!callerProfile) throw { status: 404, message: 'Profil utilisateur introuvable' };

    const isCallerSuperAdmin = callerProfile.is_superadmin;

    if (!isCallerSuperAdmin && data.role === 'superadmin') {
      throw { status: 403, message: 'Non autorisé à créer un superadmin' };
    }

    if (!isCallerSuperAdmin && !organizationId) {
      throw { status: 400, message: 'Organisation requise pour créer un utilisateur standard' };
    }

    // Check if user already exists in auth.users
    // Supabase will throw User already registered anyway.
    if (!data.password) {
        data.password = Math.random().toString(36).slice(-8) + 'Aa1!'; // generer mot de passe par defaut
    }

    // 2. Create in Auth (Supabase Admin API)
    const newUserId = await this.authService.createAdminUser(data.email, data.password);

    // 3. Create profile
    await prisma.profiles.create({
      data: {
        id: newUserId,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        is_superadmin: data.role === 'superadmin',
        actif: data.actif
      }
    });

    // 4. Link to organization if caller is not superadmin or creating for an organization
    // Important: if a superadmin creates a superadmin, they don't get an org.
    if (organizationId && data.role !== 'superadmin') {
      await prisma.organization_members.create({
         data: {
            organization_id: organizationId,
            user_id: newUserId,
            role: data.role === 'gestionnaire' ? 'admin' : 'member', // Map business role to org role
            status: 'active'
         }
      });
    }

    return await prisma.profiles.findUnique({ where: { id: newUserId } });
  }

  async updateUser(userId: string, data: {
    nom?: string;
    prenom?: string;
    role: string;
    telephone?: string;
    actif: boolean;
  }, callerId: string) {
    const callerProfile = await prisma.profiles.findUnique({ where: { id: callerId } });
    const isCallerSuperAdmin = callerProfile?.is_superadmin;

    const targetUser = await prisma.profiles.findUnique({ where: { id: userId } });
    if (!targetUser) throw { status: 404, message: 'Utilisateur non trouvé' };

    if (!isCallerSuperAdmin && data.role === 'superadmin') {
      throw { status: 403, message: 'Non autorisé à attribuer le rôle superadmin' };
    }

    if (!isCallerSuperAdmin && targetUser.is_superadmin) {
        throw { status: 403, message: 'Non autorisé à modifier un superadmin' };
    }

    // Update profile
    await prisma.profiles.update({
      where: { id: userId },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        is_superadmin: data.role === 'superadmin',
        actif: data.actif
      }
    });

    // We might also need to update organization_members role if requested, but left simple for now.
    return { success: true };
  }

  async deactivateUser(userId: string, callerId: string) {
    const callerProfile = await prisma.profiles.findUnique({ where: { id: callerId } });
    const targetUser = await prisma.profiles.findUnique({ where: { id: userId } });

    if (!targetUser) throw { status: 404, message: 'Utilisateur non trouvé' };

    if (!callerProfile?.is_superadmin && targetUser.is_superadmin) {
      throw { status: 403, message: 'Non autorisé à désactiver un superadmin' };
    }

    await prisma.profiles.update({
      where: { id: userId },
      data: { actif: false }
    });

    return { success: true };
  }

  async getUsers(callerId: string, organizationId?: string, isSuperAdminMode = false) {
    const callerProfile = await prisma.profiles.findUnique({ where: { id: callerId } });

    if (isSuperAdminMode) {
      if (!callerProfile?.is_superadmin) {
        throw { status: 403, message: 'Accès refusé' };
      }
      // Superadmin mode: Return superadmins WITHOUT organization
      const allSuperAdmins = await prisma.profiles.findMany({
        where: { is_superadmin: true },
        orderBy: { created_at: 'desc' }
      });

      const superAdminsWithOrgs = await prisma.organization_members.findMany({
         where: { user_id: { in: allSuperAdmins.map(sa => sa.id) } },
         select: { user_id: true }
      });
      const idsWithOrgs = new Set(superAdminsWithOrgs.map(m => m.user_id));

      const unassignedSuperAdmins = allSuperAdmins.map(p => ({
         ...p,
         role: 'superadmin' // Format for frontend
      })).filter(p => !idsWithOrgs.has(p.id));

      return unassignedSuperAdmins;
    } else {
      if (!organizationId) {
         throw { status: 400, message: 'Organisation requise pour lister les utilisateurs' };
      }
      
      // Get all profiles for the current organization
      const members = await prisma.organization_members.findMany({
         where: { organization_id: organizationId },
      });

      const userIds = members.map(m => m.user_id);
      
      const profiles = await prisma.profiles.findMany({
         where: { id: { in: userIds } }
      });

      return members.map(m => {
          const p = profiles.find(profile => profile.id === m.user_id);
          return {
              ...p,
              role: p?.is_superadmin ? 'superadmin' : (m.role === 'admin' ? 'gestionnaire' : 'user'),
              joined_at: m.joined_at,
              status: m.status
          };
      });
    }
  }
}

export const usersService = new UsersService();
