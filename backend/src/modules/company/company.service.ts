import { prisma } from '../../core/prisma';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from './company.validation';

export class CompanyService {

  async getAll(filters?: { active?: boolean; hasSubscriptionLink?: boolean }) {
    // On reproduit l’ordre actuel: ORDER BY nom ASC
    const compagnies = await prisma.compagnies.findMany({
      where: {
        ...(typeof filters?.active === 'boolean' ? { actif: filters.active } : {}),
        ...(filters?.hasSubscriptionLink ? { lien_souscription: { not: null } } : {}),
      },
      orderBy: { nom: 'asc' },
    });
    return compagnies;
  }

  async getById(id: string) {
    const compagnie = await prisma.compagnies.findUnique({
      where: { id },
    });
    return compagnie;
  }

  async create(payload: CreateCompanyInput) {
    const data = {
      nom: payload.nom.trim(),
      sigle: payload.sigle.trim().toUpperCase(),
      description: payload.description?.trim() || undefined,
      logo_url: payload.logo_url ?? undefined,
      lien_souscription:
        payload.lien_souscription?.trim() || undefined,
      actif: typeof payload.actif === 'boolean' ? payload.actif : true,
    };

    const compagnie = await prisma.compagnies.create({ data });
    return compagnie;
  }

  async update(id: string, payload: UpdateCompanyInput) {
    const existing = await prisma.compagnies.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    const data: UpdateCompanyInput = {};

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

    const updated = await prisma.compagnies.update({
      where: { id },
      data,
    });

    return updated;
  }

  async delete(id: string) {
    const existing = await prisma.compagnies.findUnique({
      where: { id },
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
