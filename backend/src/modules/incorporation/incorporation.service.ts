import { Prisma } from '@prisma/client';
import { prisma } from '../../core/prisma';
import type { CreateIncorporationInput, IncorporationsListQuery } from './incorporation.validation';

const toDate = (value: string) => new Date(value);
const toDecimal = (value: number | string) => new Prisma.Decimal(value);

const dec = (value: unknown) => {
  if (value === null || typeof value === 'undefined') return new Prisma.Decimal(0);
  if (value instanceof Prisma.Decimal) return value;
  // Prisma may return Decimal-like; fallback to string
  return new Prisma.Decimal(String(value));
};

export class IncorporationService {
  async getAll(filters: IncorporationsListQuery, organizationId: string) {
    const where: Record<string, any> = {
      organization_id: organizationId,
    };
    if (filters.contratId) where.contrat_id = filters.contratId;

    return prisma.incorporations.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        profiles: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
      },
    });
  }

  async getById(id: string, organizationId: string) {
    return prisma.incorporations.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
      include: {
        profiles: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
      },
    });
  }

  async create(payload: CreateIncorporationInput, organizationId: string) {
    return prisma.$transaction(async (tx) => {
      const contrat = await tx.contrats.findFirst({
        where: {
          id: payload.contrat_id,
          organization_id: organizationId,
        },
      });
      if (!contrat) {
        throw Object.assign(new Error('Contrat non trouvé'), { status: 404 });
      }

      const created = await tx.incorporations.create({
        data: {
          contrat_id: payload.contrat_id,
          date_effet: toDate(payload.date_effet),
          date_expiration:
            payload.date_expiration === null || typeof payload.date_expiration === 'undefined'
              ? null
              : toDate(payload.date_expiration),
          nombre_elements: payload.nombre_elements,
          prime_ttc: toDecimal(payload.prime_ttc),
          fga: toDecimal(payload.fga),
          taxes: toDecimal(payload.taxes),
          montant_accessoire:
            payload.montant_accessoire === null || typeof payload.montant_accessoire === 'undefined'
              ? null
              : toDecimal(payload.montant_accessoire),
          prime_nette: toDecimal(payload.prime_nette),
          commission: toDecimal(payload.commission),
          notes: payload.notes ?? null,
          created_by: payload.created_by ?? null,
          organization_id: organizationId,
        },
        include: {
          profiles: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
        },
      });

      // Met à jour le contrat en incrémentant les montants
      const nextPrimeTtc = dec((contrat as any).prime_ttc).plus(toDecimal(payload.prime_ttc));
      const nextPrimeNette = dec((contrat as any).prime_nette).plus(toDecimal(payload.prime_nette));
      const nextFga = dec((contrat as any).fga).plus(toDecimal(payload.fga));
      const nextTaxes = dec((contrat as any).taxes).plus(toDecimal(payload.taxes));
      const nextAccessoire = dec((contrat as any).montant_accessoire).plus(
        toDecimal(payload.montant_accessoire ?? 0),
      );
      const nextMontantIncorp = dec((contrat as any).montant_incorporations).plus(
        toDecimal(payload.prime_ttc),
      );
      const nextCommission = dec((contrat as any).commission).plus(toDecimal(payload.commission));

      const nextNombreIncorp = (Number((contrat as any).nombre_incorporations ?? 0) || 0) + 1;

      await tx.contrats.update({
        where: { id: payload.contrat_id },
        data: {
          prime_ttc: nextPrimeTtc,
          prime_nette: nextPrimeNette,
          fga: nextFga,
          taxes: nextTaxes,
          montant_accessoire: nextAccessoire,
          montant_incorporations: nextMontantIncorp,
          nombre_incorporations: nextNombreIncorp,
          commission: nextCommission,
          updated_at: new Date(),
        } as any,
      });

      return created;
    });
  }
}

