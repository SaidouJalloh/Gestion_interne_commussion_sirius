import { prisma } from '../../core/prisma';
import type {
  CreateVehiculeInput,
  UpdateVehiculeInput,
  VehiculesListQuery,
} from './vehicule.validation';

const toDate = (value: string) => new Date(value);

export class VehiculeService {
  async getAll(filters: VehiculesListQuery, organizationId: string) {
    const where: Record<string, any> = {
      organization_id: organizationId,
    };
    if (filters.contratId) where.contrat_id = filters.contratId;
    if (typeof filters.active === 'boolean') where.actif = filters.active;

    return prisma.vehicules.findMany({
      where,
      orderBy: { created_at: 'asc' },
    });
  }

  async getById(id: string, organizationId: string) {
    return prisma.vehicules.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
  }

  async create(payload: CreateVehiculeInput, organizationId: string) {
    return prisma.vehicules.create({
      data: {
        contrat_id: payload.contrat_id,
        immatriculation: payload.immatriculation,
        marque: payload.marque ?? null,
        modele: payload.modele ?? null,
        annee: payload.annee ?? null,
        valeur_venale:
          typeof payload.valeur_venale === 'undefined' || payload.valeur_venale === null
            ? null
            : typeof payload.valeur_venale === 'number'
              ? payload.valeur_venale
              : payload.valeur_venale,
        puissance_fiscale: payload.puissance_fiscale ?? null,
        numero_chassis: payload.numero_chassis ?? null,
        date_mise_circulation:
          payload.date_mise_circulation === null || typeof payload.date_mise_circulation === 'undefined'
            ? null
            : toDate(payload.date_mise_circulation),
        usage: payload.usage ?? null,
        notes: payload.notes ?? null,
        organization_id: organizationId,
      },
    });
  }

  async update(id: string, payload: UpdateVehiculeInput, organizationId: string) {
    const existing = await prisma.vehicules.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
    if (!existing) return null;

    const data: Record<string, unknown> = {};

    if (typeof payload.contrat_id === 'string') data.contrat_id = payload.contrat_id;
    if (typeof payload.immatriculation === 'string') data.immatriculation = payload.immatriculation;
    if ('marque' in payload) data.marque = payload.marque ?? null;
    if ('modele' in payload) data.modele = payload.modele ?? null;
    if ('annee' in payload) data.annee = payload.annee ?? null;
    if ('valeur_venale' in payload) data.valeur_venale = (payload as any).valeur_venale ?? null;
    if ('puissance_fiscale' in payload) data.puissance_fiscale = payload.puissance_fiscale ?? null;
    if ('numero_chassis' in payload) data.numero_chassis = payload.numero_chassis ?? null;
    if ('date_mise_circulation' in payload) {
      const v = (payload as any).date_mise_circulation;
      data.date_mise_circulation = v ? toDate(v) : null;
    }
    if ('usage' in payload) data.usage = payload.usage ?? null;
    if ('notes' in payload) data.notes = payload.notes ?? null;
    if (typeof payload.actif === 'boolean') data.actif = payload.actif;

    data.updated_at = new Date();

    return prisma.vehicules.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, organizationId: string) {
    const existing = await prisma.vehicules.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
    if (!existing) return false;

    await prisma.vehicules.update({
      where: { id },
      data: { actif: false, updated_at: new Date() },
    });

    return true;
  }
}

