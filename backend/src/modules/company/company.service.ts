import { Prisma } from '@prisma/client';
import { prisma } from '../../core/prisma';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from './company.validation';

export class CompanyService {

  async getAll(
    organizationId: string,
    filters?: { active?: boolean; hasSubscriptionLink?: boolean },
  ) {
    // On reproduit l'ordre actuel: ORDER BY nom ASC
    const compagnies = await prisma.compagnies.findMany({
      where: {
        organization_id: organizationId,
        ...(typeof filters?.active === 'boolean' ? { actif: filters.active } : {}),
        ...(filters?.hasSubscriptionLink ? { lien_souscription: { not: null } } : {}),
      },
      orderBy: { nom: 'asc' },
    });
    return compagnies;
  }

  async getById(id: string, organizationId: string) {
    const compagnie = await prisma.compagnies.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
    return compagnie;
  }

  async create(payload: CreateCompanyInput, organizationId: string) {
    const nom = payload.nom.trim();
    const sigle = payload.sigle.trim().toUpperCase();

    // Vérifier l'unicité du nom dans l'organisation
    const existingNom = await prisma.compagnies.findFirst({
      where: {
        organization_id: organizationId,
        nom,
      },
    });

    if (existingNom) {
      const error = new Error(
        `Une compagnie avec le nom "${nom}" existe déjà dans cette organisation`,
      ) as Error & { status?: number };
      error.status = 409;
      throw error;
    }

    // Vérifier l'unicité du sigle dans l'organisation
    const existingSigle = await prisma.compagnies.findFirst({
      where: {
        organization_id: organizationId,
        sigle,
      },
    });

    if (existingSigle) {
      const error = new Error(
        `Une compagnie avec le sigle "${sigle}" existe déjà dans cette organisation`,
      ) as Error & { status?: number };
      error.status = 409;
      throw error;
    }

    const data = {
      organization_id: organizationId,
      nom,
      sigle,
      description: payload.description?.trim() || undefined,
      logo_url: payload.logo_url ?? undefined,
      lien_souscription:
        payload.lien_souscription?.trim() || undefined,
      actif: typeof payload.actif === 'boolean' ? payload.actif : true,
      api_config: payload.api_config !== undefined ? (payload.api_config as any) : undefined,
    };

    const compagnie = await prisma.compagnies.create({ data });
    return compagnie;
  }

  async update(id: string, payload: UpdateCompanyInput, organizationId: string) {
    const existing = await prisma.compagnies.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });

    if (!existing) {
      return null;
    }

    const data: Record<string, unknown> = {};

    if (typeof payload.nom === 'string') {
      data.nom = payload.nom.trim();
    }

    if (typeof payload.sigle === 'string') {
      data.sigle = payload.sigle.trim().toUpperCase();
    }

    if (typeof payload.description === 'string') {
      data.description = payload.description.trim();
    }

    if ('logo_url' in payload) {
      data.logo_url = payload.logo_url ?? null;
    }

    if ('lien_souscription' in payload) {
      data.lien_souscription =
        payload.lien_souscription?.trim() ?? null;
    }

    if (typeof payload.actif === 'boolean') {
      data.actif = payload.actif;
    }

    if ('taux_commissions' in payload) {
      data.taux_commissions = payload.taux_commissions as unknown as any;
    }

    if ('api_config' in payload) {
      (data as any).api_config = payload.api_config === null
        ? Prisma.JsonNull
        : payload.api_config as unknown as any;
    }

    const updated = await prisma.compagnies.update({
      where: { id },
      data,
    });

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const existing = await prisma.compagnies.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });

    if (!existing) {
      return false;
    }

    await prisma.compagnies.delete({
      where: { id },
    });

    return true;
  }
}
